import { Link } from '@react-email/components';
import { EMAIL_CONFIG } from '@/lib/email/config';

interface ButtonProps {
  href: string;
  text: string;
  color?: string;
  textColor?: string;
}

/**
 * Email CTA Button Component
 * Cross-client compatible button with fallback for Outlook
 */
export default function Button({
  href,
  text,
  color = EMAIL_CONFIG.templates.buttonColor,
  textColor = EMAIL_CONFIG.templates.buttonTextColor,
}: ButtonProps) {
  return (
    <table
      width="100%"
      border={0}
      cellSpacing={0}
      cellPadding={0}
      style={styles.tableContainer}
    >
      <tr>
        <td align="center">
          {/* Outlook fallback */}
          {/*[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="${color}" fillcolor="${color}">
            <w:anchorlock/>
            <center style="color:${textColor};font-family:sans-serif;font-size:16px;font-weight:bold;">${text}</center>
          </v:roundrect>
          <![endif]-->*/}

          {/* Standard button */}
          <Link
            href={href}
            style={{
              ...styles.button,
              backgroundColor: color,
              color: textColor,
            }}
          >
            {text}
          </Link>
        </td>
      </tr>
    </table>
  );
}

const styles = {
  tableContainer: {
    margin: '24px 0',
  },
  button: {
    display: 'inline-block',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center' as const,
    minWidth: '200px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};
