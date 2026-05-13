import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileSearch } from 'lucide-react'
import { SubmitEvidenceDialog } from '@/components/submissions/SubmitEvidenceDialog'
import { PlaybookEixo1 } from '@/components/submissions/PlaybookEixo1'
import { PlaybookEixo2 } from '@/components/submissions/PlaybookEixo2'
import { PlaybookEixo3 } from '@/components/submissions/PlaybookEixo3'
import { SubmissionsHistory } from '@/components/submissions/SubmissionsHistory'

export default function Submissions() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string
    points: number
    axis: string
  } | null>(null)

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span>Cofre de Evidências</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            <span>Acompanhe o status das suas submissões garantindo a rastreabilidade.</span>
          </p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl flex items-center gap-3 shadow-sm border border-primary/20">
          <FileSearch className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider">Transparência</span>
            <span className="text-sm font-bold">100% Auditável</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="nivel1" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-1 md:grid-cols-4 bg-muted/60 p-1.5 rounded-lg h-auto gap-2">
          <TabsTrigger
            value="nivel1"
            className="text-xs md:text-sm py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all whitespace-normal h-full text-center"
          >
            <span>Playbook Eixo I – Formação e Conhecimento</span>
          </TabsTrigger>
          <TabsTrigger
            value="nivel2"
            className="text-xs md:text-sm py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all whitespace-normal h-full text-center"
          >
            <span>Playbook Eixo II – Atuação e Impacto Social</span>
          </TabsTrigger>
          <TabsTrigger
            value="nivel3"
            className="text-xs md:text-sm py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all whitespace-normal h-full text-center"
          >
            <span>Playbook Eixo III – Representatividade e Liderança</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs md:text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all h-full"
          >
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nivel1" className="animate-slide-up outline-none">
          <PlaybookEixo1 onSelect={setSelectedItem as any} />
        </TabsContent>

        <TabsContent value="nivel2" className="animate-slide-up outline-none">
          <PlaybookEixo2 onSelect={setSelectedItem as any} />
        </TabsContent>

        <TabsContent value="nivel3" className="animate-slide-up outline-none">
          <PlaybookEixo3 onSelect={setSelectedItem as any} />
        </TabsContent>

        <TabsContent value="history" className="animate-slide-up outline-none">
          <SubmissionsHistory />
        </TabsContent>
      </Tabs>

      <SubmitEvidenceDialog
        key={selectedItem?.title || 'empty-dialog'}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem as any}
      />
    </div>
  )
}
