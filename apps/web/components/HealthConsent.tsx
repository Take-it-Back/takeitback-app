import Link from "next/link";
import { redirect } from "next/navigation";
import { recordHealthConsent } from "@/lib/actions";
import { CtaButton } from "@/components/ui";

/**
 * One-time, separate consent before we collect health information from documents
 * (Washington My Health My Data Act, Nevada SB 370, Connecticut and similar state laws).
 */
export default function HealthConsent({ next = "/app/scan" }: { next?: string }) {
  async function agree() {
    "use server";
    await recordHealthConsent();
    redirect(next);
  }
  return (
    <form action={agree} className="stack g16" style={{ maxWidth: 560 }}>
      <h1 className="page-title" style={{ fontSize: 34, margin: 0 }}>Before you <em className="o">scan</em></h1>
      <p style={{ margin: 0, fontSize: 16 }}>
        Medical bills, insurance letters and other papers can include health information, like the care you got and what it cost. We use AI to read them. We need your OK first.
      </p>
      <ul className="band stack g8" style={{ margin: 0, padding: "14px 18px", listStyle: "none", fontSize: 15 }}>
        <li><strong>Why:</strong> only to read your papers, find problems, write your letters and track your dates.</li>
        <li><strong>AI reading:</strong> to read your papers, write your letters and read their replies, we send the pages and case details to Anthropic, the company that makes the Claude AI models. Anthropic processes them only for us and doesn&apos;t use them to train its models.</li>
        <li><strong>Who else sees it:</strong> you, helpers you invite, and the services that store your files and send mail or faxes when you ask.</li>
        <li><strong>Never:</strong> sold, used for ads, or shared for anything else without asking you again.</li>
        <li><strong>Your control:</strong> download or delete everything anytime from your account.</li>
      </ul>
      <label className="row g12" style={{ alignItems: "flex-start", fontSize: 15 }}>
        <input type="checkbox" name="agree" required style={{ width: 22, height: 22, accentColor: "#1A1A1A", flex: "none", marginTop: 2 }} />
        <span>I agree that Take it back may collect and use health information in the documents I add, and send my documents and case details to Anthropic&apos;s AI to read them and write letters, as described in the <Link href="/privacy" target="_blank">Privacy Policy</Link> and <Link href="/health-data-privacy" target="_blank">Consumer Health Data Privacy Policy</Link>.</span>
      </label>
      <CtaButton type="submit" variant="orange">I agree, continue</CtaButton>
      <Link href="/app" className="muted small">Not now</Link>
    </form>
  );
}
