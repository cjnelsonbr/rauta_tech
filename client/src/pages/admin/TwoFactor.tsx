import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle, AlertCircle, Shield } from "lucide-react";

export default function AdminTwoFactor() {
  const { data: status } = trpc.twoFactor.getStatus.useQuery();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateMutation = trpc.twoFactor.generateSecret.useMutation({
    onSuccess: (data) => {
      setSetupData(data);
    },
  });

  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: () => {
      setIsSetupOpen(false);
      setVerificationCode("");
      setSetupData(null);
    },
  });

  const disableMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      setIsDisableOpen(false);
      setVerificationCode("");
    },
  });

  const handleGenerateSecret = async () => {
    await generateMutation.mutateAsync();
    setIsSetupOpen(true);
  };

  const handleVerify = async () => {
    if (!verificationCode) return;
    await verifyMutation.mutateAsync({ token: verificationCode });
  };

  const handleDisable = async () => {
    if (!verificationCode) return;
    await disableMutation.mutateAsync({ token: verificationCode });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">Autenticação em Duas Etapas</h1>
          <p className="text-gray-400">
            Configure a autenticação em duas etapas para proteger sua conta com o Google Authenticator
          </p>
        </div>

        {/* Status Card */}
        <div className="border border-green-500/30 rounded-lg p-6 bg-green-500/5">
          <div className="flex items-center gap-4">
            <Shield className={`w-8 h-8 ${status?.isEnabled ? "text-green-500" : "text-gray-500"}`} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Status da 2FA</h2>
              <p className="text-sm text-gray-400">
                {status?.isEnabled ? "Ativada" : "Desativada"}
              </p>
            </div>
            {status?.isEnabled && (
              <Button
                onClick={() => setIsDisableOpen(true)}
                variant="destructive"
                className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
              >
                Desativar
              </Button>
            )}
            {!status?.isEnabled && (
              <Button
                onClick={handleGenerateSecret}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                Ativar 2FA
              </Button>
            )}
          </div>
        </div>

        {status?.isEnabled && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">
              Sua conta está protegida com autenticação em duas etapas. Você tem {status.hasBackupCodes} códigos de backup disponíveis.
            </AlertDescription>
          </Alert>
        )}

        {!status?.isEnabled && (
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              Ative a autenticação em duas etapas para melhorar a segurança da sua conta.
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Dialog */}
        <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
          <DialogContent className="bg-black border border-green-500/30 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-500">Configurar Autenticação em Duas Etapas</DialogTitle>
              <DialogDescription className="text-gray-400">
                Siga os passos abaixo para ativar a 2FA
              </DialogDescription>
            </DialogHeader>

            {setupData ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                  <img
                    src={setupData.qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    1. Escaneie o código QR com o Google Authenticator
                  </p>
                  <p className="text-sm text-gray-400">
                    2. Ou insira manualmente: <code className="bg-gray-900 px-2 py-1 rounded text-green-500">{setupData.secret}</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-semibold">Códigos de Backup:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {setupData.backupCodes.map((code: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => copyToClipboard(code, index)}
                        className="bg-gray-900 border border-green-500/30 rounded p-2 text-sm text-green-500 hover:bg-green-500/10 transition-colors flex items-center justify-between"
                      >
                        {code}
                        {copiedIndex === index && (
                          <CheckCircle className="w-3 h-3 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-500">
                    ⚠️ Salve esses códigos em um local seguro. Você pode usá-los para acessar sua conta se perder o acesso ao autenticador.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Código de Verificação</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="bg-gray-900 border-green-500/30 text-white mt-1 text-center text-2xl tracking-widest"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Gerando código...</p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSetupOpen(false);
                  setSetupData(null);
                  setVerificationCode("");
                }}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVerify}
                disabled={!verificationCode || verificationCode.length !== 6}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                Ativar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disable Dialog */}
        <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
          <DialogContent className="bg-black border border-red-500/30">
            <DialogHeader>
              <DialogTitle className="text-red-500">Desativar Autenticação em Duas Etapas</DialogTitle>
              <DialogDescription className="text-gray-400">
                Insira seu código de verificação para desativar a 2FA
              </DialogDescription>
            </DialogHeader>

            <div>
              <label className="text-sm text-gray-400">Código de Verificação</label>
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                maxLength={6}
                className="bg-gray-900 border-red-500/30 text-white mt-1 text-center text-2xl tracking-widest"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDisableOpen(false);
                  setVerificationCode("");
                }}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDisable}
                disabled={!verificationCode || verificationCode.length !== 6}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Desativar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

