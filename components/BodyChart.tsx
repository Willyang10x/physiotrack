"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface BodyChartProps {
  onPartsChange: (parts: string[]) => void;
  selectedParts?: string[];
  readOnly?: boolean;
}

// === DEFINIÇÃO DOS CAMINHOS SVG BASE ===
const p_head = "M100 20 A15 15 0 1 1 100 50 A15 15 0 1 1 100 20 Z";
const p_neck = "M92 50 L108 50 L108 60 L92 60 Z";
const p_chest = "M85 60 L115 60 L110 90 L90 90 Z";
const p_abdomen = "M90 90 L110 90 L108 115 L92 115 Z";
const p_pelvis = "M92 115 L108 115 L112 130 L88 130 Z";

// Lado DIREITO da TELA (x > 100) -> Braço/Perna Esq. (Frente) | Braço/Perna Dir. (Costas)
const p_shoulder_R_scr = "M115 60 L135 65 L130 80 L110 75 Z";
const p_arm_R_scr = "M130 80 L135 65 L145 90 L138 95 Z";
const p_forearm_R_scr = "M138 95 L145 90 L150 110 L142 115 Z";
const p_hand_R_scr = "M142 115 L150 110 L155 125 L145 125 Z";
const p_thigh_R_scr = "M108 130 L112 130 L110 170 L102 170 Z";
const p_knee_R_scr = "M102 170 L110 170 L108 185 L104 185 Z";
const p_leg_R_scr = "M104 185 L108 185 L106 220 L102 220 Z";
const p_foot_R_scr = "M102 220 L106 220 L110 230 L100 230 Z";

// Lado ESQUERDO da TELA (x < 100) -> Braço/Perna Dir. (Frente) | Braço/Perna Esq. (Costas)
const p_shoulder_L_scr = "M85 60 L65 65 L70 80 L90 75 Z";
const p_arm_L_scr = "M70 80 L65 65 L55 90 L62 95 Z";
const p_forearm_L_scr = "M62 95 L55 90 L50 110 L58 115 Z";
const p_hand_L_scr = "M58 115 L50 110 L45 125 L55 125 Z";
const p_thigh_L_scr = "M92 130 L88 130 L90 170 L98 170 Z";
const p_knee_L_scr = "M98 170 L90 170 L92 185 L96 185 Z";
const p_leg_L_scr = "M96 185 L92 185 L94 220 L98 220 Z";
const p_foot_L_scr = "M98 220 L94 220 L90 230 L100 230 Z";

const BODY_PARTS = [
  // ================= FRENTE =================
  { id: "head", name: "Rosto", view: "front", d: p_head },
  { id: "neck", name: "Pescoço", view: "front", d: p_neck },
  { id: "chest", name: "Peitoral", view: "front", d: p_chest },
  { id: "abdomen", name: "Abdômen", view: "front", d: p_abdomen },
  { id: "pelvis", name: "Quadril", view: "front", d: p_pelvis },
  // Esquerda (Tela Direita)
  { id: "shoulder_l", name: "Ombro Esq.", view: "front", d: p_shoulder_R_scr },
  { id: "arm_l", name: "Braço Esq.", view: "front", d: p_arm_R_scr },
  { id: "forearm_l", name: "Antebraço Esq.", view: "front", d: p_forearm_R_scr },
  { id: "hand_l", name: "Mão Esq.", view: "front", d: p_hand_R_scr },
  { id: "thigh_l", name: "Coxa Esq.", view: "front", d: p_thigh_R_scr },
  { id: "knee_l", name: "Joelho Esq.", view: "front", d: p_knee_R_scr },
  { id: "leg_l", name: "Canela Esq.", view: "front", d: p_leg_R_scr },
  { id: "foot_l", name: "Pé Esq.", view: "front", d: p_foot_R_scr },
  // Direita (Tela Esquerda)
  { id: "shoulder_r", name: "Ombro Dir.", view: "front", d: p_shoulder_L_scr },
  { id: "arm_r", name: "Braço Dir.", view: "front", d: p_arm_L_scr },
  { id: "forearm_r", name: "Antebraço Dir.", view: "front", d: p_forearm_L_scr },
  { id: "hand_r", name: "Mão Dir.", view: "front", d: p_hand_L_scr },
  { id: "thigh_r", name: "Coxa Dir.", view: "front", d: p_thigh_L_scr },
  { id: "knee_r", name: "Joelho Dir.", view: "front", d: p_knee_L_scr },
  { id: "leg_r", name: "Canela Dir.", view: "front", d: p_leg_L_scr },
  { id: "foot_r", name: "Pé Dir.", view: "front", d: p_foot_L_scr },

  // ================= COSTAS =================
  { id: "head_back", name: "Nuca", view: "back", d: p_head },
  { id: "neck_back", name: "Cervical", view: "back", d: p_neck },
  { id: "upper_back", name: "Costas (Dorsal)", view: "back", d: p_chest },
  { id: "lower_back", name: "Lombar", view: "back", d: p_abdomen },
  { id: "glutes", name: "Glúteos", view: "back", d: p_pelvis },
  // Esquerda vista de trás (Fica na Tela Esquerda)
  { id: "shoulder_l_back", name: "Ombro Esq. (Post.)", view: "back", d: p_shoulder_L_scr },
  { id: "arm_l_back", name: "Tríceps Esq.", view: "back", d: p_arm_L_scr },
  { id: "forearm_l_back", name: "Antebraço Esq.", view: "back", d: p_forearm_L_scr },
  { id: "hand_l_back", name: "Dorso Mão Esq.", view: "back", d: p_hand_L_scr },
  { id: "thigh_l_back", name: "Posterior Coxa Esq.", view: "back", d: p_thigh_L_scr },
  { id: "calf_l", name: "Panturrilha Esq.", view: "back", d: p_leg_L_scr },
  { id: "heel_l", name: "Calcanhar Esq.", view: "back", d: p_foot_L_scr },
  // Direita vista de trás (Fica na Tela Direita)
  { id: "shoulder_r_back", name: "Ombro Dir. (Post.)", view: "back", d: p_shoulder_R_scr },
  { id: "arm_r_back", name: "Tríceps Dir.", view: "back", d: p_arm_R_scr },
  { id: "forearm_r_back", name: "Antebraço Dir.", view: "back", d: p_forearm_R_scr },
  { id: "hand_r_back", name: "Dorso Mão Dir.", view: "back", d: p_hand_R_scr },
  { id: "thigh_r_back", name: "Posterior Coxa Dir.", view: "back", d: p_thigh_R_scr },
  { id: "calf_r", name: "Panturrilha Dir.", view: "back", d: p_leg_R_scr },
  { id: "heel_r", name: "Calcanhar Dir.", view: "back", d: p_foot_R_scr },
];

export function BodyChart({ onPartsChange, selectedParts = [], readOnly = false }: BodyChartProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedParts);
  const [view, setView] = useState<"front" | "back">("front");

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

  // Filtramos os caminhos SVG para renderizar apenas os da vista atual
  const visibleParts = BODY_PARTS.filter((part) => part.view === view);

  return (
    <div className="flex flex-col items-center">
      
      {/* Botões para alternar entre Frente e Costas */}
      <div className="flex bg-gray-100 p-1 rounded-full mb-6 relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setView("front")}
          className={cn(
            "rounded-full px-6 transition-all font-bold",
            view === "front" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Frente
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setView("back")}
          className={cn(
            "rounded-full px-6 transition-all font-bold",
            view === "back" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Costas
        </Button>
      </div>

      {/* Mapa do Corpo */}
      <div className="relative w-48 h-64 md:w-64 md:h-80">
        <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-lg">
          {/* Silhueta Base - Fica igual para dar o formato de fundo */}
          <path d="M100 20 A15 15 0 1 1 100 50 L108 60 L135 65 L145 90 L150 110 L155 125 L145 125 L142 115 L138 95 L130 80 L112 130 L110 170 L108 185 L106 220 L110 230 L90 230 L94 220 L92 185 L90 170 L88 130 L70 80 L62 95 L58 115 L45 125 L55 125 L50 110 L55 90 L65 65 L92 60 Z" 
                fill="#e5e7eb" stroke="none" />

          {/* Renderiza as partes clicáveis dependendo de estar de frente ou costas */}
          {visibleParts.map((part) => {
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
      
      {/* Legenda dos locais selecionados */}
      {!readOnly && (
        <div className="mt-6 text-center">
          <p className="text-sm font-bold text-gray-700 mb-2">Locais mapeados:</p>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[320px]">
            {internalSelected.length > 0 ? (
              internalSelected.map((id) => {
                const part = BODY_PARTS.find((p) => p.id === id);
                return (
                  <span key={id} className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200 shadow-sm">
                    {part?.name}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-md border border-dashed">
                Toque no corpo para mapear a dor.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}