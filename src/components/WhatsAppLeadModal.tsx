import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MessageCircle, ArrowRight } from 'lucide-react';
import { useCreateLead } from '@/hooks/useLeads';

// Country data with flag emojis and codes
const COUNTRIES = [
  { code: '244', flag: '🇦🇴', name: 'Angola' },
  { code: '55', flag: '🇧🇷', name: 'Brasil' },
  { code: '351', flag: '🇵🇹', name: 'Portugal' },
  { code: '258', flag: '🇲🇿', name: 'Moçambique' },
  { code: '239', flag: '🇸🇹', name: 'São Tomé e Príncipe' },
  { code: '245', flag: '🇬🇼', name: 'Guiné-Bissau' },
  { code: '670', flag: '🇹🇱', name: 'Timor-Leste' },
] as const;

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  countryCode: z.string().min(1, 'Selecione um país'),
  phoneNumber: z
    .string()
    .trim()
    .min(6, 'Número de telefone inválido')
    .max(15, 'Número muito longo')
    .regex(/^[\d\s()-]+$/, 'Use apenas números'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface WhatsAppLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappGroupLink?: string;
}

const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/GRUPO_AQUI'; // Substituir pelo link real

export default function WhatsAppLeadModal({
  open,
  onOpenChange,
  whatsappGroupLink = WHATSAPP_GROUP_LINK,
}: WhatsAppLeadModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      countryCode: '244', // Angola as default
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      const fullWhatsapp = `+${data.countryCode}${data.phoneNumber.replace(/[\s()-]/g, '')}`;
      await createLead.mutateAsync({
        name: data.name,
        whatsapp: fullWhatsapp,
      });
      setSubmitted(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after modal closes
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 300);
  };

  const handleJoinGroup = () => {
    window.open(whatsappGroupLink, '_blank');
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <MessageCircle className="w-5 h-5 text-primary" />
            {submitted ? 'Bem-vindo!' : 'Entre no grupo do WhatsApp'}
          </DialogTitle>
        </DialogHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Preencha seus dados para ter acesso ao grupo exclusivo de discussões.
            </p>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                className="bg-background/50"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex gap-2">
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-24 bg-background/50">
                        <SelectValue>
                          {COUNTRIES.find(c => c.code === field.value)?.flag || '🌍'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="text-muted-foreground">+{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  id="whatsapp"
                  placeholder="999 999 999"
                  className="bg-background/50 flex-1"
                  {...register('phoneNumber')}
                />
              </div>
              {errors.countryCode && (
                <p className="text-sm text-destructive">{errors.countryCode.message}</p>
              )}
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={createLead.isPending}
            >
              {createLead.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Seus dados foram registrados com sucesso! Clique no botão abaixo para entrar no grupo.
            </p>
            <Button
              onClick={handleJoinGroup}
              className="w-full btn-primary"
            >
              Entrar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}