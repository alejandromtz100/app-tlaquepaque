import type { ReactNode } from "react";

export const APP_LOGO_SRC = `${import.meta.env.BASE_URL}assets/logo.png`;

type AppPageHeaderProps = {
  right?: ReactNode;
};

export const AppPageHeader = ({ right }: AppPageHeaderProps) => (
  <header className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={APP_LOGO_SRC}
          alt="Logo de Tlaquepaque - Ciudad de la Esperanza"
          className="h-14 w-auto shrink-0 object-contain"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Control de la Edificación ALCH
          </h1>
          <p className="text-sm text-gray-500">H. Ayuntamiento de Tlaquepaque</p>
        </div>
      </div>
      {right}
    </div>
  </header>
);
