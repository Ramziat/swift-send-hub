import { Link } from 'react-router-dom';
import { Send, Users, History, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { useI18n } from '@/lib/i18n';

const features = [
  {
    icon: Zap,
    titleKey: 'home.feature.fast',
    descKey: 'home.feature.fast.desc',
  },
  {
    icon: Shield,
    titleKey: 'home.feature.secure',
    descKey: 'home.feature.secure.desc',
  },
  {
    icon: Globe,
    titleKey: 'home.feature.multilang',
    descKey: 'home.feature.multilang.desc',
  },
];

const Index = () => {
  const { t } = useI18n();
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8 md:py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('home.hero.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {t('home.hero.title.pre')}{' '}
            <span className="text-transparent bg-clip-text gradient-hero">
              {t('home.hero.title.highlight')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {t('home.hero.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link to="/send">
              <Button size="xl" className="w-full sm:w-auto">
                <Send className="w-5 h-5" />
                {t('home.hero.cta.send')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/bulk">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Users className="w-5 h-5" />
                {t('home.hero.cta.bulk')}
              </Button>
            </Link>
          </div>
        </section>
        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
          {features.map((feature, index) => (
            <Card 
              key={feature.titleKey} 
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(feature.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/send" className="group">
            <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">
                  {t('home.quick.individual.title')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('home.quick.individual.desc')}
                </p>
                <span className="text-primary font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  {t('home.quick.individual.cta')} <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/bulk" className="group">
            <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 gradient-secondary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mb-4 shadow-glow-blue group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">
                  {t('home.quick.bulk.title')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('home.quick.bulk.desc')}
                </p>
                <span className="text-secondary font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  {t('home.quick.bulk.cta')} <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </section>
        {/* Stats Preview */}
        <Card className="gradient-hero text-primary-foreground overflow-hidden">
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">100K+</p>
                <p className="text-primary-foreground/80 text-sm">{t('home.stats.users')}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">5M+</p>
                <p className="text-primary-foreground/80 text-sm">{t('home.stats.transactions')}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">99.9%</p>
                <p className="text-primary-foreground/80 text-sm">{t('home.stats.reliability')}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">24/7</p>
                <p className="text-primary-foreground/80 text-sm">{t('home.stats.availability')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
