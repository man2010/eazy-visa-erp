import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Database,
  Lock,
  Mail
} from 'lucide-react';

export function SettingsModule() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Paramètres</h1>
        <p className="text-gray-600">Configuration de l'application</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Apparence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input placeholder="Jean" />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input placeholder="Dupont" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="jean.dupont@entreprise.com" />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input placeholder="+33 6 12 34 56 78" />
              </div>
              <div>
                <Label>Poste</Label>
                <Input placeholder="Directeur" />
              </div>
              <div>
                <Label>Département</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option>IT</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>RH</option>
                  <option>Commercial</option>
                </select>
              </div>
              <Button>Enregistrer les modifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <h4>Notifications par email</h4>
                  </div>
                  <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <h4>Notifications push</h4>
                  </div>
                  <p className="text-sm text-gray-600">Recevoir des notifications dans l'application</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Nouveaux leads</h4>
                  <p className="text-sm text-gray-600">Être notifié des nouveaux leads</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Tickets de support</h4>
                  <p className="text-sm text-gray-600">Être notifié des nouveaux tickets</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Approbations en attente</h4>
                  <p className="text-sm text-gray-600">Être notifié des demandes d'approbation</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Rapports hebdomadaires</h4>
                  <p className="text-sm text-gray-600">Recevoir un résumé hebdomadaire par email</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-4">Changer le mot de passe</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Mot de passe actuel</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Confirmer le mot de passe</Label>
                    <Input type="password" />
                  </div>
                  <Button>Mettre à jour le mot de passe</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <h4>Authentification à deux facteurs</h4>
                  </div>
                  <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Sessions actives</h4>
                  <p className="text-sm text-gray-600">Gérer vos sessions sur différents appareils</p>
                </div>
                <Button variant="outline">Voir les sessions</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4>Historique de connexion</h4>
                  <p className="text-sm text-gray-600">Voir l'historique de vos connexions</p>
                </div>
                <Button variant="outline">Voir l'historique</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apparence et langue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Thème</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-2">
                  <option>Clair</option>
                  <option>Sombre</option>
                  <option>Automatique</option>
                </select>
              </div>
              <Separator />
              <div>
                <Label>Langue</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <select className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                    <option>Deutsch</option>
                  </select>
                </div>
              </div>
              <Separator />
              <div>
                <Label>Format de date</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-2">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <Separator />
              <div>
                <Label>Fuseau horaire</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-2">
                  <option>Europe/Paris (GMT+1)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Asia/Tokyo (GMT+9)</option>
                </select>
              </div>
              <Button>Enregistrer les préférences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
