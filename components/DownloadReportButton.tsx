"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  athleteName: string;
  athleteEmail: string;
  feedbacks: any[]; // Seus dados de dor/fadiga
}

export function DownloadReportButton({ data }: { data: ReportData }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // --- CABEÇALHO ---
    // Cor Azul do PhysioTrack
    doc.setFillColor(37, 99, 235); // #2563eb
    doc.rect(0, 0, 210, 20, "F"); // Barra azul no topo

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PhysioTrack - Relatório de Evolução", 14, 13);

    // --- DADOS DO PACIENTE ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Paciente: ${data.athleteName}`, 14, 30);
    doc.text(`Email: ${data.athleteEmail}`, 14, 36);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 14, 42);

    // --- ESTATÍSTICAS ---
    const totalSessoes = data.feedbacks.length;
    // Calcula média de dor (se houver dados)
    const mediaDor = totalSessoes > 0 
      ? (data.feedbacks.reduce((acc, curr) => acc + (curr.pain_level || 0), 0) / totalSessoes).toFixed(1)
      : "0";
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total de Sessões Registradas: ${totalSessoes}`, 14, 52);
    doc.text(`Média de Dor no Período: ${mediaDor}/10`, 14, 58);

    // --- TABELA DE DADOS ---
    const tableData = data.feedbacks.map((item) => [
      new Date(item.date).toLocaleDateString("pt-BR"),
      item.pain_level + " / 10",
      item.fatigue_level + " / 10",
      item.notes || "-", 
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Data", "Nível de Dor", "Cansaço", "Observações"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] }, // Cabeçalho azul
      styles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // --- RODAPÉ ---
    // AQUI ESTAVA O ERRO: Mudamos de doc.internal.getNumberOfPages() para doc.getNumberOfPages()
    const pageCount = doc.getNumberOfPages();

    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            'Gerado automaticamente por PhysioTrack', 
            doc.internal.pageSize.width / 2, 
            doc.internal.pageSize.height - 10, 
            { align: 'center' }
        );
    }

    // Baixar arquivo
    doc.save(`Relatorio_${data.athleteName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant="outline" 
      className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
    >
      <FileText className="h-4 w-4" />
      Baixar Relatório PDF
    </Button>
  );
}