interface Props {
  title: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({ title, description, icon = "🏠" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-400 max-w-sm">{description}</p>
      )}
    </div>
  );
}
