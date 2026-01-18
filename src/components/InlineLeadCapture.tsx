import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check, Users } from 'lucide-react';
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
];

const leadSchema = z.object({
  countryCode: z.string().min(1, 'Selecione um país'),
  phoneNumber: z.string()
    .min(8, 'Número deve ter pelo menos 8 dígitos')
    .max(15, 'Número muito longo')
    .regex(/^\d+$/, 'Apenas números são permitidos'),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface InlineLeadCaptureProps {
  articleUrl?: string;
}

export default function InlineLeadCapture({ articleUrl }: InlineLeadCaptureProps) {
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      countryCode: '244',
      phoneNumber: '',
    },
  });

  // Check if user already subscribed (using localStorage)
  useEffect(() => {
    const subscribedArticles = localStorage.getItem('subscribedLeadCapture');
    if (subscribedArticles) {
      const articles = JSON.parse(subscribedArticles);
      if (articles.includes(articleUrl) || articles.includes('global')) {
        setAlreadySubscribed(true);
      }
    }
  }, [articleUrl]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      const whatsappNumber = `+${data.countryCode}${data.phoneNumber}`;
      
      await createLead.mutateAsync({
        name: 'Leitor', // Default name for inline captures
        whatsapp: whatsappNumber,
      });

      // Mark as subscribed in localStorage
      const subscribedArticles = localStorage.getItem('subscribedLeadCapture');
      const articles = subscribedArticles ? JSON.parse(subscribedArticles) : [];
      articles.push(articleUrl || 'global');
      localStorage.setItem('subscribedLeadCapture', JSON.stringify(articles));

      setSubmitted(true);
      toast.success('Número registrado com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar. Tente novamente.');
    }
  };

  if (alreadySubscribed) {
    return null; // Don't show if already subscribed
  }

  if (submitted) {
    return (
      <div className="my-8 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-primary" />
        </div>
        <p className="text-foreground font-medium font-serif">Obrigado por se inscrever!</p>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 rounded-xl border-2 border-primary/20 bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h4 className="text-lg font-bold text-foreground font-serif">Participe da comunidade</h4>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-[100px] bg-background">
                  <SelectValue>
                    {COUNTRIES.find(c => c.code === field.value)?.flag} +{field.value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>+{country.code}</span>
                        <span className="text-muted-foreground text-xs">{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <Input
            {...register('phoneNumber')}
            type="tel"
            placeholder="Número de WhatsApp"
            className="flex-1 bg-background"
          />
        </div>
        
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
        
        <Button
          type="submit"
          disabled={createLead.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {createLead.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Participe da comunidade
        </Button>
      </form>
    </div>
  );
}
