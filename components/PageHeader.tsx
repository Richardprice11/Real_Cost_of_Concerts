type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-2xl text-base text-base-content/70">{subtitle}</p>
    </header>
  );
}
