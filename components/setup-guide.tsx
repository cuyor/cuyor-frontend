import { InfoCircledIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

/** Where users should write when something doesn't work. */
export const SUPPORT_EMAIL = "help@cuyor.com";

type Callout = {
  tone: "warning" | "neutral";
  icon: React.ReactNode;
  text: React.ReactNode;
};

type Step = {
  title: string;
  body: React.ReactNode;
  callout?: Callout;
};

/**
 * Setup walkthrough, shared by the marketing page and the dashboard.
 *
 * The dashboard drops the "create an account" step, since you're already signed
 * in by the time you see it. Hence `showRegisterStep`.
 */
export default function SetupGuide({
  showRegisterStep = false,
  className = "",
}: {
  showRegisterStep?: boolean;
  className?: string;
}) {
  const steps: Step[] = [
    ...(showRegisterStep
      ? [
          {
            title: "Create your account",
            body: (
              <>
                Register at <strong>cuyor.com</strong> using the email address
                your invite was sent to.
              </>
            ),
          },
        ]
      : []),
    {
      title: "Get your license key and the app",
      body: (
        <>
          In your dashboard, copy your license key and download Cuyor for macOS.
          Keep the key handy, you&apos;ll paste it in a moment.
        </>
      ),
    },
    {
      title: "Get past macOS security",
      body: (
        <>
          Cuyor is an early indie build without a registered Apple developer
          certificate yet, so macOS will flag it on first launch. That&apos;s
          expected.
        </>
      ),
      callout: {
        tone: "warning",
        icon: <InfoCircledIcon className="w-4 h-4" />,
        text: (
          <>
            Open{" "}
            <strong className="font-medium">
              Apple menu → System Settings → Privacy &amp; Security
            </strong>
            , scroll down to <strong className="font-medium">Security</strong>,
            click <strong className="font-medium">Open anyway</strong>, and
            enter your Mac password.
          </>
        ),
      },
    },
    {
      title: "Activate your license",
      body: (
        <>
          Launch Cuyor, open the{" "}
          <strong className="font-medium text-foreground">Settings</strong> tab,
          paste your license key, and press{" "}
          <strong className="font-medium text-foreground">Activate</strong>.
        </>
      ),
    },
    {
      title: "Add a free Gemini key",
      body: (
        <>
          Head to the{" "}
          <strong className="font-medium text-foreground">Backend</strong> tab.
          This key is the brain of the app. Go to{" "}
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            aistudio.google.com
          </a>
          , sign in with your Google account, click{" "}
          <strong className="font-medium text-foreground">Get API key</strong>{" "}
          in the left menu, create a new key, then copy that long string and
          paste it into Cuyor.
        </>
      ),
      callout: {
        tone: "neutral",
        icon: <LockClosedIcon className="w-4 h-4" />,
        text: (
          <>
            Cuyor is engineered to store{" "}
            <strong className="font-medium">zero data</strong>. No telemetry, no
            saved keys. Everything runs strictly at runtime.
          </>
        ),
      },
    },
    {
      title: "Take it for a spin",
      body: (
        <>
          Open something complex like Figma or Chrome, then press{" "}
          <KbdGroup className="mx-0.5 align-middle">
            <Kbd>Ctrl</Kbd>
            <Kbd>Option</Kbd>
            <Kbd>Space</Kbd>
          </KbdGroup>{" "}
          to wake Cuyor. Select the app you&apos;re working in, ask for what you
          need, and watch it guide you step by step.
        </>
      ),
    },
  ];

  return (
    <div className={className}>
      <ol className="space-y-9">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2.5rem_1fr] gap-x-2 sm:gap-x-4"
          >
            <span className="text-sm font-medium tabular-nums text-foreground/25 leading-6">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground leading-6">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                {step.body}
              </p>
              {step.callout && <CalloutRow {...step.callout} />}
            </div>
          </li>
        ))}
      </ol>

      <SupportNote className="mt-10 pt-6 border-t border-[--border-secondary]" />
    </div>
  );
}

/**
 * Soft, borderless aside for the two things worth pulling out of the flow.
 * One surface for both tones: the icon carries the emphasis, so nothing reads
 * like a boxed-in alert.
 */
function CalloutRow({ tone, icon, text }: Callout) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-secondary/50 px-3.5 py-3 text-sm leading-relaxed text-foreground/60">
      <span
        className={`mt-0.5 shrink-0 ${
          tone === "warning" ? "text-primary" : "text-foreground/40"
        }`}
      >
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

/** "Stuck? Email us" line. Standalone so pages can drop it in on its own. */
export function SupportNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-foreground/60 ${className}`}>
      Run into any friction?{" "}
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="text-primary font-medium hover:underline underline-offset-4"
      >
        {SUPPORT_EMAIL}
      </a>{" "}
      reaches a real person, and we read every message.
    </p>
  );
}
