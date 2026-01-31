import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Users } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';
import { toast } from 'sonner';

const COUNTRIES = [
  { code: '244', flag: '🇦🇴', name: 'Angola' },
  { code: '55', flag: '🇧🇷', name: 'Brasil' },
  { code: '351', flag: '🇵🇹', name: 'Portugal' },
  { code: '258', flag: '🇲🇿', name: 'Moçambique' },
  { code: '238', flag: '🇨🇻', name: 'Cabo Verde' },
  { code: '245', flag: '🇬🇼', name: 'Guiné-Bissau' },
  { code: '239', flag: '🇸🇹', name: 'São Tomé e Príncipe' },
  { code: '670', flag: '🇹🇱', name: 'Timor-Leste' },
] as const;

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  countryCode: z.string().min(1, 'Selecione um país'),
  phoneNumber: z
    .string()
    .min(6, 'Número deve ter pelo menos 6 dígitos')
    .max(20, 'Número muito longo')
    .regex(/^[\d\s-]+$/, 'Use apenas números'),
});

type FormData = z.infer<typeof formSchema>;

interface InlineLeadCaptureProps {
  articleUrl?: string;
}

export default function InlineLeadCapture({ articleUrl }: InlineLeadCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createLead = useCreateLead();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      countryCode: '244',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const cleanPhone = data.phoneNumber.replace(/[\s-]/g, '');
    const whatsapp = `+${data.countryCode}${cleanPhone}`;

    try {
      await createLead.mutateAsync({
        name: data.name.trim(),
        whatsapp,
        article_url: articleUrl,
      });

      setIsOpen(false);
      form.reset();
      toast.success('Obrigado! Em breve você será adicionado à comunidade.');
    } catch {
      toast.error('Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <>
      <div className="my-6 flex justify-center" data-lead-capture="true">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground rounded-md transition-all hover:opacity-90 hover:shadow-md"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Users className="w-4 h-4" />
          Participar da comunidade
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Entrar na comunidade
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                className="bg-background/50"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de WhatsApp</Label>
              <div className="flex gap-2">
                <Controller
                  name="countryCode"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[100px] bg-background/50">
                        <SelectValue>
                          {COUNTRIES.find((c) => c.code === field.value)?.flag} +
                          {field.value}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>+{country.code}</span>
                              <span className="text-muted-foreground text-xs">
                                {country.name}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  {...form.register('phoneNumber')}
                  type="tel"
                  placeholder="999 999 999"
                  className="flex-1 bg-background/50"
                />
              </div>
              {form.formState.errors.countryCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.countryCode.message}
                </p>
              )}
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createLead.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createLead.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Entrar na comunidade
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
