export interface ToolBarProps {
  children: React.ReactNode;
}
export default function ToolBar({ children }: ToolBarProps) {
  return (
    <div className="hidden group-hover:flex group-hover:absolute right-2 top-0 items-center" data-toolbar>
      {children}
    </div>
  );
}
