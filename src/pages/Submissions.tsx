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
          <h1 className="text-3xl font-bold tracking-tight">Cofre de Evidências</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Acompanhe o status das suas submissões garantindo a rastreabilidade.
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

      <Tabs defaultValue="eixo1" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4 bg-muted/60 p-1.5 rounded-lg h-auto">
          <TabsTrigger
            value="eixo1"
            className="text-sm py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo I
          </TabsTrigger>
          <TabsTrigger
            value="eixo2"
            className="text-sm py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo II
          </TabsTrigger>
          <TabsTrigger
            value="eixo3"
            className="text-sm py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
          >
            Playbook Eixo III
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-sm py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all"
          >
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eixo1" className="animate-slide-up outline-none">
          <PlaybookEixo1 onSelect={setSelectedItem} />
        </TabsContent>

        <TabsContent value="eixo2" className="animate-slide-up outline-none">
          <PlaybookEixo2 onSelect={setSelectedItem} />
        </TabsContent>

        <TabsContent value="eixo3" className="animate-slide-up outline-none">
          <PlaybookEixo3 onSelect={setSelectedItem} />
        </TabsContent>

        <TabsContent value="history" className="animate-slide-up outline-none">
          <SubmissionsHistory />
        </TabsContent>
      </Tabs>

      <SubmitEvidenceDialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  )
}
