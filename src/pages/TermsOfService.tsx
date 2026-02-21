import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using Minaarly ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.

These terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: '2. Description of Service',
    content: `Minaarly is an online platform that connects users with local mosques across the United Kingdom. The Service provides information about mosque locations, prayer times, community events, and allows mosque administrators to manage their mosque profiles.`,
  },
  {
    title: '3. User Accounts',
    content: `When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
• Maintaining the confidentiality of your account and password
• Restricting access to your account
• All activities that occur under your account

You must notify us immediately of any unauthorised use of your account.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to use the Service to:
• Post false, inaccurate, misleading, or defamatory content
• Violate any applicable laws or regulations
• Infringe upon the rights of others
• Transmit any harmful, offensive, or disruptive content
• Attempt to gain unauthorised access to any part of the Service
• Use the Service for any commercial solicitation without prior written consent`,
  },
  {
    title: '5. Mosque Listings & Content',
    content: `Mosque administrators who claim and manage their mosque profile are responsible for the accuracy and completeness of the information they provide. Minaarly reserves the right to remove or edit any content that violates these Terms or is otherwise inappropriate.

Users who submit mosque information or event details warrant that such information is accurate and that they have the right to submit it.

By submitting content to Minaarly, you grant us a non-exclusive, royalty-free licence to use, display, and distribute that content as part of the Service.`,
  },
  {
    title: '6. Intellectual Property',
    content: `The Service and its original content, features, and functionality are and will remain the exclusive property of Minaarly. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Minaarly.`,
  },
  {
    title: '7. Payments',
    content: `Some aspects of the Service may be supported through optional user payments. Payments are processed by third-party payment providers (such as Stripe). Minaarly does not store payment card details and is not responsible for payment processing errors.`,
  },
  {
    title: '8. Disclaimers',
    content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind. Minaarly does not warrant that:
• The Service will be uninterrupted or error-free
• Prayer times and mosque information will always be accurate or up to date
• The results obtained from using the Service will be accurate or reliable

Prayer times are provided for convenience and should not replace consultation with your local mosque.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by law, Minaarly shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, the Service.`,
  },
  {
    title: '10. Privacy',
    content: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.`,
  },
  {
    title: '11. Termination',
    content: `We reserve the right to suspend or terminate accounts that violate these Terms or misuse the Service, without prior notice.`,
  },
  {
    title: '12. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes by updating the date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.`,
  },
  {
    title: '13. Governing Law',
    content: `These Terms shall be governed and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.`,
  },
  {
    title: '14. Contact Us',
    content: `If you have any questions about these Terms of Service, please contact us at:

Email: hello@minaarly.com
Based in the United Kingdom`,
  },
];

export default function TermsOfService() {
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
            Terms of Service
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
          >
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
              Please read these Terms of Service carefully before using Minaarly. These terms govern your access to and use of our platform and services.
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
