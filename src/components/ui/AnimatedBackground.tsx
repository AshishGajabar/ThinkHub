export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
      <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/50 blur-[120px]" />
    </div>
  );
}
