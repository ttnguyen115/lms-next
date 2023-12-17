type HeaderProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
};

export function Header({ open, setOpen, activeItem }: Readonly<HeaderProps>) {
  return <div>Header</div>;
}
