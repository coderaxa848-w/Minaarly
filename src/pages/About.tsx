import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';
import { Heart, Users, Globe, Target } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Minaarly
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting communities to their local mosques
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg max-w-none mb-16"
          >
            <p className="text-muted-foreground text-lg leading-relaxed">
              Minaarly was born from a simple observation: finding accurate prayer times, 
              discovering local Islamic events, and connecting with nearby mosques shouldn't 
              be difficult. Whether you're a lifelong community member, a student in a new city, 
              or a traveler looking for a place to pray, Minaarly makes it easy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { icon: Target, title: 'Our Mission', desc: 'To strengthen the connection between Muslims and their local masjids through technology.' },
              { icon: Heart, title: 'Community First', desc: 'Built by the community, for the community. Every feature is designed with your needs in mind.' },
              { icon: Globe, title: 'Accessible', desc: 'Free to use for everyone. We believe in removing barriers to community connection.' },
              { icon: Users, title: 'Growing Together', desc: 'As more mosques join, the platform becomes more valuable for everyone.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-2xl border bg-card"
              >
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
