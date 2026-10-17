type ComPermissao = {
  requestPermission?: () => Promise<PermissionState>;
};

/**
 * O iPhone só libera o movimento do aparelho dentro do toque do usuário.
 * Os dois pedidos precisam sair antes de qualquer outro `await`.
 */
export function pedirMovimento() {
  const pedidos: Promise<unknown>[] = [];
  const eventos = window as unknown as Record<string, ComPermissao | undefined>;
  for (const evento of [eventos.DeviceMotionEvent, eventos.DeviceOrientationEvent]) {
    const pedir = evento?.requestPermission;
    if (typeof pedir === "function") {
      pedidos.push(pedir.call(evento).catch(() => "denied"));
    }
  }
  return Promise.all(pedidos);
}
