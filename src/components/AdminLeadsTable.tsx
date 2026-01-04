import { useState } from 'react';
import { useAdminLeads } from '@/hooks/useLeads';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminLeadsTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminLeadsTable({ open, onOpenChange }: AdminLeadsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminLeads(page, 20);

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (data && page < data.totalPages) setPage(page + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-border max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Leads Capturados
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.total} total)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : data && data.leads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <a
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {lead.whatsapp}
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead cadastrado ainda.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Página {page} de {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page === data.totalPages}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
