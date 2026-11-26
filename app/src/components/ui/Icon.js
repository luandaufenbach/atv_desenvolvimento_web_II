// Ícone Material Symbols Outlined (fonte carregada em styles/tokens/fonts.css)
export default function Icon({ name, size = 20, fill = false, weight = 400, color, style, className = '', ...rest }) {
  const opsz = Math.max(20, Math.min(48, size));
  return (
    <span
      aria-hidden={rest['aria-label'] ? undefined : true}
      className={('material-symbols-outlined ' + className).trim()}
      style={{
        fontSize: size,
        width: size,
        height: size,
        lineHeight: size + 'px',
        color,
        flexShrink: 0,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${opsz}`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  );
}
