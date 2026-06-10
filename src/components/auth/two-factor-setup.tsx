// src/components/auth/two-factor-setup.tsx
"use client";

import { useState } from "react";
import { generate2FASecret, verifyAndEnable2FA, disable2FA } from "@/lib/actions/2fa";
import { Shield, ShieldAlert, ShieldCheck, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/loading-button";
import Image from "next/image";

interface TwoFactorSetupProps {
  isAlreadyEnabled: boolean;
}

export default function TwoFactorSetup({ isAlreadyEnabled }: TwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(isAlreadyEnabled);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Iniciar la configuración (Generar QR)
  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await generate2FASecret();
      setSecretKey(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setIsConfiguring(true);
    } catch (error) {
      toast.error("Error al generar el código de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verificar el código ingresado
  const handleVerify = async () => {
    if (token.length !== 6) {
      toast.error("El código debe tener 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyAndEnable2FA(token);
      if (result.success) {
        toast.success(result.message);
        setIsEnabled(true);
        setIsConfiguring(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al verificar el código.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Desactivar el 2FA
  const handleDisable = async () => {
    if (!confirm("¿Estás seguro de que quieres desactivar la autenticación de dos factores? Esto reducirá la seguridad de tu cuenta.")) return;
    
    setLoading(true);
    try {
      const result = await disable2FA();
      if (result.success) {
        toast.success(result.message);
        setIsEnabled(false);
        setQrCodeUrl(null);
        setSecretKey(null);
        setToken("");
      }
    } catch (error) {
      toast.error("Error al desactivar el 2FA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-module border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
      
      {/* Cabecera Informativa */}
      <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className={`p-3 rounded-xl flex-shrink-0 ${isEnabled ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
          {isEnabled ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Autenticación en Dos Pasos (2FA)
          </h3>
          <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Agrega una capa adicional de seguridad a tu cuenta requiriendo un código numérico aleatorio al iniciar sesión.
          </p>
        </div>
      </div>

      {/* ESTADO 1: Activado */}
      {isEnabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
            <Shield className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={20} />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Tu cuenta está altamente protegida. Se solicitará un código de tu aplicación autenticadora (ej. Google Authenticator) en tu próximo inicio de sesión.
            </p>
          </div>
          <LoadingButton 
            onClick={handleDisable} 
            isLoading={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            Desactivar 2FA
          </LoadingButton>
        </div>
      )}

      {/* ESTADO 2: Desactivado */}
      {!isEnabled && !isConfiguring && (
        <LoadingButton 
          onClick={handleStartSetup} 
          isLoading={loading}
          className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest"
        >
          Configurar 2FA ahora
        </LoadingButton>
      )}

      {/* ESTADO 3: Configurando (Muestra el QR) */}
      {isConfiguring && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
              <QrCode size={18} className="text-brand-600" /> Escanea este código
            </h4>
            <p className="text-xs text-slate-500">
              Abre tu aplicación de autenticación (Google Authenticator, Authy o Microsoft Authenticator) y escanea el siguiente código QR:
            </p>
            
            {qrCodeUrl && (
              <div className="mx-auto w-48 h-48 bg-white p-3 rounded-xl border-2 border-brand-500 shadow-xl overflow-hidden">
                <Image 
                  src={qrCodeUrl} 
                  alt="Código QR para 2FA" 
                  width={200} 
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                ¿No puedes escanear el código?
              </p>
              <code className="text-xs bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-brand-700 dark:text-brand-400 font-mono font-black break-all select-all">
                {secretKey}
              </code>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Smartphone size={16} className="text-brand-500" />
              Ingresa el código de 6 dígitos que muestra tu aplicación
            </label>
            <div className="flex gap-3">
              <input 
                type="text" 
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))} // Solo permite números
                placeholder="000000"
                className="form-input flex-1 text-center font-mono text-2xl font-black tracking-[0.5em]"
              />
              <LoadingButton 
                onClick={handleVerify} 
                isLoading={loading}
                disabled={token.length !== 6}
                className="px-8 text-xs font-black uppercase tracking-widest"
              >
                Verificar
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}