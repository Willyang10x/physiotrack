"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface ReportData {
  athleteName: string;
  athleteEmail: string;
  feedbacks: any[];
}

export function DownloadReportButton({ data }: { data: ReportData }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();

      // --- PÁGINA 1: TABELA E TEXTOS ---
      
      // Cabeçalho Azul
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 20, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("PhysioTrack - Relatório de Evolução", 14, 13);

      // Dados do Paciente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Paciente: ${data.athleteName}`, 14, 30);
      doc.text(`Email: ${data.athleteEmail}`, 14, 36);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 14, 42);

      // Estatísticas
      const totalSessoes = data.feedbacks.length;
      const mediaDor = totalSessoes > 0 
        ? (data.feedbacks.reduce((acc, curr) => acc + (curr.pain_level || 0), 0) / totalSessoes).toFixed(1)
        : "0";
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Total de Sessões: ${totalSessoes}`, 14, 52);
      doc.text(`Média de Dor: ${mediaDor}/10`, 14, 58);

      // Tabela
      const tableData = data.feedbacks.map((item) => [
        new Date(item.date).toLocaleDateString("pt-BR"),
        item.pain_level + " / 10",
        item.fatigue_level + " / 10",
        item.notes || "-", 
      ]);

      autoTable(doc, {
        startY: 65,
        head: [["Data", "Dor", "Cansaço", "Observações"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      // --- PÁGINA 2: O GRÁFICO ---
      
      // 1. Procura o elemento HTML do gráfico pelo ID que vamos criar
      const chartElement = document.getElementById("evolution-chart-print");

      if (chartElement) {
        // 2. Tira o print do elemento
        const canvas = await html2canvas(chartElement, { scale: 2 }); // Scale 2 melhora a qualidade
        const imgData = canvas.toDataURL("image/png");
        
        // 3. Adiciona nova página e cola a imagem
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Gráfico de Evolução Visual", 14, 20);
        
        // Ajusta dimensões (A4 tem 210mm de largura. Deixamos margens)
        const imgWidth = 180; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, "PNG", 15, 30, imgWidth, imgHeight);
      }

      // Rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
              `Página ${i} de ${pageCount} - Gerado por PhysioTrack`, 
              doc.internal.pageSize.width / 2, 
              doc.internal.pageSize.height - 10, 
              { align: 'center' }
          );
      }

      doc.save(`Relatorio_${data.athleteName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      alert("Erro ao gerar o PDF com gráfico.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant="outline" 
      disabled={loading}
      className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      {loading ? "Gerando..." : "Baixar Relatório Completo"}
    </Button>
  );
}