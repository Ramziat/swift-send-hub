import { Link } from 'react-router-dom';
import { Send, Users, History, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';

const features = [
  {
    icon: Zap,
    title: 'Rapide & Simple',
    description: 'Envoyez de l\'argent en quelques secondes',
  },
  {
    icon: Shield,
    title: 'Sécurisé',
    description: 'Transactions protégées et cryptées',
  },
  {
    icon: Globe,
    title: 'Multilingue',
    description: 'Confirmation vocale en Français et Anglais',
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8 md:py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Transfert d'argent mobile
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            Envoyez de l'argent{' '}
            <span className="text-transparent bg-clip-text gradient-hero">
              facilement
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
            Transférez de l'argent à vos proches en toute simplicité. 
            Paiements individuels ou en masse, avec confirmation vocale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link to="/send">
              <Button size="xl" className="w-full sm:w-auto">
                <Send className="w-5 h-5" />
                Envoyer de l'argent
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/bulk">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Users className="w-5 h-5" />
                Paiement de masse
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
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
                  Paiement Individuel
                </h3>
                <p className="text-muted-foreground mb-4">
                  Envoyez de l'argent à une personne rapidement et simplement.
                </p>
                <span className="text-primary font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  Commencer <ArrowRight className="w-4 h-4" />
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
                  Paiement de Masse
                </h3>
                <p className="text-muted-foreground mb-4">
                  Envoyez à plusieurs personnes en une seule opération.
                </p>
                <span className="text-secondary font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  Mode Admin <ArrowRight className="w-4 h-4" />
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
                <p className="text-primary-foreground/80 text-sm">Utilisateurs</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">5M+</p>
                <p className="text-primary-foreground/80 text-sm">Transactions</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">99.9%</p>
                <p className="text-primary-foreground/80 text-sm">Fiabilité</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-1">24/7</p>
                <p className="text-primary-foreground/80 text-sm">Disponibilité</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
