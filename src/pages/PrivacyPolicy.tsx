import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you create an account, claim a mosque, or contact us. This may include your name, email address, and any other information you choose to provide.

We also automatically collect certain information when you use Minaarly, including your IP address, browser type, operating system, referring URLs, and information about your use of our services.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Send you technical notices and support messages
• Respond to your comments and questions
• Notify you about changes to our services
• Monitor and analyse usage and trends to improve your experience`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not share your personal information with third parties except as described in this policy. We may share your information with:
• Service providers who assist us in operating our platform
• Law enforcement or other parties when required by law
• Other parties with your consent

We do not sell your personal information to any third party.`,
  },
  {
    title: '4. Data Security',
    content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorised access, disclosure, alteration, and destruction. Your data is stored securely using industry-standard encryption.`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our service may not function correctly.`,
  },
  {
    title: '6. Your Rights',
    content: `Depending on your location, you may have certain rights regarding your personal information, including:
• The right to access the personal information we hold about you
• The right to request correction of inaccurate data
• The right to request deletion of your data
• The right to object to or restrict processing of your data

To exercise any of these rights, please contact us at hello@minaarly.com.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `Minaarly is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date. We encourage you to review this policy periodically.`,
  },
  {
    title: '9. Contact Us',
    content: `If you have any questions about this Privacy Policy, please contact us at:

Email: hello@minaarly.com
Based in the United Kingdom`,
  },
];

export default function PrivacyPolicy() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-16 md:py-24 border-b">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-primary uppercase tracking-widest mb-3"
          >
            Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Last updated: February 2026
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
              At Minaarly, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>

            <div className="space-y-10">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="border-b border-muted pb-10 last:border-0"
                >
                  <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
