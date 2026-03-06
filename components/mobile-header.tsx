"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import Image from "next/image";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-40 shadow-sm">
      
      <div className="flex items-center">
         <Image 
           src="/FLAVICON-COM-RETANGULO-physio-track.png"
           alt="PhysioTrack Logo"
           width={40} 
           height={40}
           className="object-contain"
           priority
         />
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-white border-r-0">
          
          <SheetTitle className="sr-only">Menu de Navegação Mobile</SheetTitle>
          
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}