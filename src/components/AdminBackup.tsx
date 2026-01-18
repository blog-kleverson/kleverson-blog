import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Download, Loader2, HardDrive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BackupMetadata {
  id: string;
  created_at: string;
  posts_count: number;
  leads_count: number;
}

interface AdminBackupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminBackup({ open, onOpenChange }: AdminBackupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);

  // Load backup history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('backupHistory');
    if (history) {
      setBackupHistory(JSON.parse(history));
    }
  }, [open]);

  const generateCSV = (data: Record<string, unknown>[], filename: string): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const createZipContent = async (files: { name: string; content: string }[]): Promise<Blob> => {
    // Simple ZIP implementation using DataView
    const textEncoder = new TextEncoder();
    const zipParts: Uint8Array[] = [];
    const centralDirectory: Uint8Array[] = [];
    let offset = 0;

    for (const file of files) {
      const fileNameBytes = textEncoder.encode(file.name);
      // Add BOM for UTF-8 CSV files
      const contentBytes = file.name.endsWith('.csv') 
        ? new Uint8Array([0xEF, 0xBB, 0xBF, ...textEncoder.encode(file.content)])
        : textEncoder.encode(file.content);

      // Local file header
      const localHeader = new Uint8Array(30 + fileNameBytes.length);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true); // signature
      localView.setUint16(4, 20, true); // version needed
      localView.setUint16(6, 0, true); // flags
      localView.setUint16(8, 0, true); // compression
      localView.setUint16(10, 0, true); // mod time
      localView.setUint16(12, 0, true); // mod date
      localView.setUint32(14, 0, true); // crc32
      localView.setUint32(18, contentBytes.length, true); // compressed size
      localView.setUint32(22, contentBytes.length, true); // uncompressed size
      localView.setUint16(26, fileNameBytes.length, true); // filename length
      localView.setUint16(28, 0, true); // extra field length
      localHeader.set(fileNameBytes, 30);

      zipParts.push(localHeader);
      zipParts.push(contentBytes);

      // Central directory entry
      const centralEntry = new Uint8Array(46 + fileNameBytes.length);
      const centralView = new DataView(centralEntry.buffer);
      centralView.setUint32(0, 0x02014b50, true); // signature
      centralView.setUint16(4, 20, true); // version made by
      centralView.setUint16(6, 20, true); // version needed
      centralView.setUint16(8, 0, true); // flags
      centralView.setUint16(10, 0, true); // compression
      centralView.setUint16(12, 0, true); // mod time
      centralView.setUint16(14, 0, true); // mod date
      centralView.setUint32(16, 0, true); // crc32
      centralView.setUint32(20, contentBytes.length, true); // compressed size
      centralView.setUint32(24, contentBytes.length, true); // uncompressed size
      centralView.setUint16(28, fileNameBytes.length, true); // filename length
      centralView.setUint16(30, 0, true); // extra field length
      centralView.setUint16(32, 0, true); // comment length
      centralView.setUint16(34, 0, true); // disk number
      centralView.setUint16(36, 0, true); // internal attrs
      centralView.setUint32(38, 0, true); // external attrs
      centralView.setUint32(42, offset, true); // offset
      centralEntry.set(fileNameBytes, 46);

      centralDirectory.push(centralEntry);
      offset += localHeader.length + contentBytes.length;
    }

    // End of central directory
    const centralDirOffset = offset;
    let centralDirSize = 0;
    centralDirectory.forEach(entry => centralDirSize += entry.length);

    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    endView.setUint32(0, 0x06054b50, true); // signature
    endView.setUint16(4, 0, true); // disk number
    endView.setUint16(6, 0, true); // central dir disk
    endView.setUint16(8, files.length, true); // entries on this disk
    endView.setUint16(10, files.length, true); // total entries
    endView.setUint32(12, centralDirSize, true); // central dir size
    endView.setUint32(16, centralDirOffset, true); // central dir offset
    endView.setUint16(20, 0, true); // comment length

    // Convert to proper ArrayBuffer types for Blob
    const allParts: BlobPart[] = [
      ...zipParts.map(p => p.buffer as ArrayBuffer),
      ...centralDirectory.map(p => p.buffer as ArrayBuffer),
      endRecord.buffer as ArrayBuffer
    ];

    return new Blob(allParts, { type: 'application/zip' });
  };

  const handleBackup = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all data
      const [postsResult, leadsResult] = await Promise.all([
        supabase.from('posts').select('*'),
        supabase.from('leads').select('*'),
      ]);

      if (postsResult.error) throw postsResult.error;
      if (leadsResult.error) throw leadsResult.error;

      const posts = postsResult.data || [];
      const leads = leadsResult.data || [];

      // Format leads for CSV
      const formattedLeads = leads.map(lead => ({
        Nome: lead.name,
        WhatsApp: lead.whatsapp,
        'Data de Cadastro': format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      }));

      // Format posts for CSV
      const formattedPosts = posts.map(post => ({
        ID: post.id,
        Titulo: post.title,
        Slug: post.slug,
        Categoria: post.category,
        Status: post.status,
        Destaque: post.featured ? 'Sim' : 'Não',
        Popular: post.popular ? 'Sim' : 'Não',
        'Data Publicação': post.published_at ? format(new Date(post.published_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '',
        'Data Criação': format(new Date(post.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        'Data Atualização': format(new Date(post.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        Subtitulo: post.subtitle || '',
        Descricao: post.description || '',
        Corpo: post.body || '',
        'Imagem Capa': post.cover_image || '',
      }));

      // Metadata
      const metadata = {
        'Data do Backup': format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        'Total de Posts': posts.length,
        'Total de Leads': leads.length,
        'Versão': '1.0',
      };

      // Create files
      const files = [
        { name: 'artigos.csv', content: generateCSV(formattedPosts, 'artigos') },
        { name: 'leads_comunidade.csv', content: generateCSV(formattedLeads, 'leads') },
        { name: 'metadados.csv', content: generateCSV([metadata], 'metadados') },
      ];

      // Create ZIP
      const zipBlob = await createZipContent(files);
      
      // Download
      const filename = `backup_${format(new Date(), 'yyyy-MM-dd')}.zip`;
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to history (keep last 4)
      const newBackup: BackupMetadata = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        posts_count: posts.length,
        leads_count: leads.length,
      };
      
      const newHistory = [newBackup, ...backupHistory].slice(0, 4);
      setBackupHistory(newHistory);
      localStorage.setItem('backupHistory', JSON.stringify(newHistory));

      toast.success(`Backup exportado com sucesso (${posts.length} posts, ${leads.length} leads)`);
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Erro ao gerar backup. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setBackupHistory([]);
    localStorage.removeItem('backupHistory');
    toast.success('Histórico limpo');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" />
            Sistema de Backup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              Gere um backup completo do banco de dados incluindo artigos, leads e metadados em formato ZIP.
            </p>
            <Button 
              onClick={handleBackup} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Gerar Backup Agora
            </Button>
          </div>

          {backupHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Histórico de Backups</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearHistory}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              </div>
              <div className="space-y-2">
                {backupHistory.map((backup) => (
                  <div 
                    key={backup.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(backup.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {backup.posts_count} posts, {backup.leads_count} leads
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
