import Link from "next/link";

function Button({ variant, children, href = "", onClick = null }) {
  const primary = "bg-primary text-text-primary hover:bg-primary-600";
  const secondary = "border border-text-primary bg-surface text-text-primary";

  if (href && !onClick) {
    return (
      <Link
        className={`w-fit flex items-center py-2 px-4 rounded hover:scale-105 transition-all duration-200 ${
          variant === "secondary" ? secondary : primary
        }`}
        href={href}
      >
        {children}
      </Link>
    );
  } else
    return (
      <button
        className={`w-fit flex items-center py-2 px-4 rounded hover:scale-105 transition-all duration-200 ${
          variant === "secondary" ? secondary : primary
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    );
}

export default Button;
