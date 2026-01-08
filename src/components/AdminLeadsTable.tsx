import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminLeads, Lead } from '@/hooks/useLeads';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ChevronLeft, ChevronRight, Users, Trash2, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AdminLeadsTableProps { open: boolean; onOpenChange: (open: boolean) => void; }

export default function AdminLeadsTable({ open, onOpenChange }: AdminLeadsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminLeads(page, 20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => { setSelectedIds(new Set()); setLastSelectedIndex(null); }, [page, open]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.leads) setSelectedIds(new Set(data.leads.map(l => l.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (leadId: string, index: number, shiftKey: boolean) => {
    const newSelected = new Set(selectedIds);
    if (shiftKey && lastSelectedIndex !== null && data?.leads) {
      const start = Math.min(lastSelectedIndex, index), end = Math.max(lastSelectedIndex, index);
      for (let i = start; i <= end; i++) newSelected.add(data.leads[i].id);
    } else {
      if (newSelected.has(leadId)) newSelected.delete(leadId);
      else newSelected.add(leadId);
    }
    setSelectedIds(newSelected);
    setLastSelectedIndex(index);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('leads').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} leads deletados com sucesso`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      refetch();
    } catch { toast.error('Erro ao processar. Tente novamente.'); }
    finally { setIsDeleting(false); setShowDeleteConfirm(false); }
  };

  const exportToCSV = useCallback((leads: Lead[]) => {
    const BOM = '\uFEFF';
    const header = 'Nome,WhatsApp,Data de Cadastro\n';
    const rows = leads.map(lead => {
      const formattedDate = format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      const name = lead.name.includes(',') ? `"${lead.name}"` : lead.name;
      return `${name},${lead.whatsapp},${formattedDate}`;
    }).join('\n');
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success(`CSV exportado com sucesso (${leads.length} leads)`);
  }, []);

  const handleExportSelected = () => {
    if (!data?.leads || selectedIds.size === 0) return;
    exportToCSV(data.leads.filter(l => selectedIds.has(l.id)));
  };

  const isAllSelected = data?.leads && data.leads.length > 0 && data.leads.every(l => selectedIds.has(l.id));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl bg-card border-border max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />Leads Capturados
              {data && <span className="text-sm font-normal text-muted-foreground">({data.total} total)</span>}
            </DialogTitle>
          </DialogHeader>

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-sm font-medium">{selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}><X className="w-4 h-4 mr-1" />Desselecionar</Button>
                <Button variant="outline" size="sm" onClick={handleExportSelected}><Download className="w-4 h-4 mr-1" />Baixar CSV</Button>
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="w-4 h-4 mr-1" />Deletar</Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            {isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
            : data && data.leads.length > 0 ? (
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="w-12"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                  <TableHead>Nome</TableHead><TableHead>WhatsApp</TableHead><TableHead>Data de Cadastro</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {data.leads.map((lead, index) => (
                    <TableRow key={lead.id} className={selectedIds.has(lead.id) ? 'bg-muted/30' : ''}>
                      <TableCell><Checkbox checked={selectedIds.has(lead.id)} onClick={(e) => handleSelectOne(lead.id, index, e.shiftKey)} /></TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell><a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{lead.whatsapp}</a></TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Nenhum lead cadastrado ainda.</p></div>}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Página {page} de {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" />Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => data && page < data.totalPages && setPage(page + 1)} disabled={page === data.totalPages}>Próximo<ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deletando...</> : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
