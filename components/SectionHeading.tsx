type SectionHeadingProps = {
  title: string;
  description?: string;
};

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-base-content/60">{description}</p>}
    </div>
  );
}
