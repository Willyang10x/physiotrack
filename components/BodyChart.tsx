"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BodyChartProps {
  onPartsChange: (parts: string[]) => void;
  selectedParts?: string[];
  readOnly?: boolean;
}

// Lista de partes do corpo com seus caminhos SVG (simplificados para visualização clara)
const BODY_PARTS = [
  { id: "head", name: "Cabeça", d: "M100 20 A15 15 0 1 1 100 50 A15 15 0 1 1 100 20 Z" },
  { id: "neck", name: "Pescoço", d: "M92 50 L108 50 L108 60 L92 60 Z" },
  { id: "chest", name: "Peito", d: "M85 60 L115 60 L110 90 L90 90 Z" },
  { id: "abdomen", name: "Abdômen", d: "M90 90 L110 90 L108 115 L92 115 Z" },
  { id: "pelvis", name: "Quadril", d: "M92 115 L108 115 L112 130 L88 130 Z" },
  
  // Braços Esquerdo (Visão do observador = direita da tela)
  { id: "shoulder_l", name: "Ombro Esq.", d: "M115 60 L135 65 L130 80 L110 75 Z" },
  { id: "arm_l", name: "Braço Esq.", d: "M130 80 L135 65 L145 90 L138 95 Z" },
  { id: "forearm_l", name: "Antebraço Esq.", d: "M138 95 L145 90 L150 110 L142 115 Z" },
  { id: "hand_l", name: "Mão Esq.", d: "M142 115 L150 110 L155 125 L145 125 Z" },

  // Braços Direito (Visão do observador = esquerda da tela)
  { id: "shoulder_r", name: "Ombro Dir.", d: "M85 60 L65 65 L70 80 L90 75 Z" },
  { id: "arm_r", name: "Braço Dir.", d: "M70 80 L65 65 L55 90 L62 95 Z" },
  { id: "forearm_r", name: "Antebraço Dir.", d: "M62 95 L55 90 L50 110 L58 115 Z" },
  { id: "hand_r", name: "Mão Dir.", d: "M58 115 L50 110 L45 125 L55 125 Z" },

  // Pernas Esquerda
  { id: "thigh_l", name: "Coxa Esq.", d: "M108 130 L112 130 L110 170 L102 170 Z" },
  { id: "knee_l", name: "Joelho Esq.", d: "M102 170 L110 170 L108 185 L104 185 Z" },
  { id: "leg_l", name: "Canela Esq.", d: "M104 185 L108 185 L106 220 L102 220 Z" },
  { id: "foot_l", name: "Pé Esq.", d: "M102 220 L106 220 L110 230 L100 230 Z" },

  // Pernas Direita
  { id: "thigh_r", name: "Coxa Dir.", d: "M92 130 L88 130 L90 170 L98 170 Z" },
  { id: "knee_r", name: "Joelho Dir.", d: "M98 170 L90 170 L92 185 L96 185 Z" },
  { id: "leg_r", name: "Canela Dir.", d: "M96 185 L92 185 L94 220 L98 220 Z" },
  { id: "foot_r", name: "Pé Dir.", d: "M98 220 L94 220 L90 230 L100 230 Z" },
];

export function BodyChart({ onPartsChange, selectedParts = [], readOnly = false }: BodyChartProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedParts);

  const togglePart = (partId: string) => {
    if (readOnly) return;

    let newSelected;
    if (internalSelected.includes(partId)) {
      newSelected = internalSelected.filter((id) => id !== partId);
    } else {
      newSelected = [...internalSelected, partId];
    }
    setInternalSelected(newSelected);
    onPartsChange(newSelected);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-64 md:w-64 md:h-80">
        <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-lg">
          {/* Sombra/Contorno Geral para dar volume */}
          <path d="M100 20 A15 15 0 1 1 100 50 L108 60 L135 65 L145 90 L150 110 L155 125 L145 125 L142 115 L138 95 L130 80 L112 130 L110 170 L108 185 L106 220 L110 230 L90 230 L94 220 L92 185 L90 170 L88 130 L70 80 L62 95 L58 115 L45 125 L55 125 L50 110 L55 90 L65 65 L92 60 Z" 
                fill="#e5e7eb" stroke="none" />

          {BODY_PARTS.map((part) => {
            const isSelected = internalSelected.includes(part.id);
            return (
              <path
                key={part.id}
                d={part.d}
                onClick={() => togglePart(part.id)}
                className={cn(
                  "cursor-pointer transition-all duration-300 stroke-white stroke-[1px]",
                  readOnly ? "cursor-default" : "hover:fill-red-300",
                  isSelected ? "fill-red-500 animate-pulse" : "fill-blue-200"
                )}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legenda do que foi selecionado */}
      {!readOnly && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Locais selecionados:</p>
          <div className="flex flex-wrap gap-1 justify-center max-w-[300px]">
            {internalSelected.length > 0 ? (
              internalSelected.map((id) => {
                const part = BODY_PARTS.find((p) => p.id === id);
                return (
                  <span key={id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200">
                    {part?.name}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-gray-400 italic">Nenhum local marcado (Toque no corpo)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}