import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Lock, Mail, FlaskConical, Atom } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const sites = [
  { code: "NDS", name: "NDS" },
  { code: "HSD1", name: "HSD1" },
  { code: "HSD2", name: "HSD2" },
  { code: "HSD3", name: "HSD3" },
  { code: "DHJ", name: "DHJ" },
  { code: "APL", name: "APL" },
  { code: "TCD", name: "TCD" }
];

const disciplines = [
  { code: "OP", name: "Operation" },
  { code: "EG", name: "Engineering & Utility" },
  { code: "EV", name: "Environment" },
  { code: "SF", name: "Safety" },
  { code: "QA", name: "Quality" },
  { code: "OT", name: "Others" }
];

const roles = [
  { code: "INIT_LEAD", name: "Initiative Lead" },
  { code: "APPROVER", name: "Approver" },
  { code: "SITE_TSO_LEAD", name: "Site TSO Lead" },
  { code: "CORP_TSO", name: "Corp TSO" },
  { code: "SITE_CORP_TSO", name: "Site & Corp TSO" }
];

interface AuthProps {
  onLogin: (user: any) => void;
}

export default function AuthPage({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    site: "",
    discipline: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        // Real API login
        const result = await login(formData.email, formData.password);
        console.log('Login result:', result);
        
        if (result.success) {
          console.log('AuthPage: Login successful - navigation should happen automatically');
          toast({
            title: "Login Successful",
            description: "Welcome back to OpEx Hub!",
          });
          // Clear form data after successful login
          setFormData(prev => ({ ...prev, password: '' }));
          
          // Navigation happens automatically in AuthContext via useNavigate
        } else {
          console.log('Login failed with error:', result.error);
          toast({
            title: "Login Failed",
            description: result.error || "Invalid credentials",
            variant: "destructive"
          });
        }
      } else {
        // Real API signup
        if (!formData.fullName || !formData.site || !formData.discipline || !formData.role) {
          toast({
            title: "Signup Failed",
            description: "Please fill in all required fields.",
            variant: "destructive"
          });
          return;
        }

        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          site: formData.site,
          discipline: formData.discipline,
          role: formData.role,
          roleName: roles.find(r => r.code === formData.role)?.name || ""
        };

        const result = await register(userData);
        
        if (result.success) {
          toast({
            title: "Signup Successful",
            description: "Account created successfully! Please sign in.",
          });
          setIsLogin(true); // Switch to login tab
        } else {
          toast({
            title: "Signup Failed",
            description: result.error || "Registration failed",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: isLogin ? "Login Failed" : "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Chemical Background with Molecular Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1611567434239-4319af406477?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxtb2xlY3VsZSUyMGJhY2tncm91bmR8ZW58MHx8fGJsdWV8MTc1NTUzNjgwMHww&ixlib=rb-4.1.0&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Floating Chemical Molecules Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="molecule-float absolute top-20 left-10 w-4 h-4 bg-cyan-400 rounded-full opacity-60 animate-float"></div>
          <div className="molecule-float absolute top-40 right-20 w-3 h-3 bg-emerald-400 rounded-full opacity-50 animate-float-delayed"></div>
          <div className="molecule-float absolute bottom-32 left-1/4 w-5 h-5 bg-blue-400 rounded-full opacity-40 animate-float-slow"></div>
          <div className="molecule-float absolute bottom-20 right-1/3 w-2 h-2 bg-teal-400 rounded-full opacity-70 animate-float"></div>
          <div className="molecule-float absolute top-1/3 left-2/3 w-6 h-6 bg-cyan-300 rounded-full opacity-30 animate-float-delayed"></div>
          
          {/* Chemical Bond Lines */}
          <div className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 -rotate-45 animate-pulse"></div>
        </div>
      </div>
      
      {/* Glassmorphism Container */}
      <div className="relative w-full max-w-md mx-4">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo Section with Chemical Flask Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img
                  src="https://www.godeepak.com/wp-content/uploads/2024/01/DNL-Logo.png"
                  alt="DNL Logo"
                  className="h-16 w-auto drop-shadow-lg"
                />
                <div className="absolute -top-2 -right-2">
                  <FlaskConical className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Title Section with Chemical Theme */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Atom className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                <h2 className="text-2xl font-bold text-white">OpEx Hub</h2>
                <Atom className="w-6 h-6 text-cyan-400 animate-spin-slow" />
              </div>
              <p className="text-sm text-blue-200 opacity-90">Operational Excellence Platform</p>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mt-3"></div>
            </div>
            
            <CardTitle className="text-xl text-white mb-2">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-blue-200">
              {isLogin 
                ? "Enter your credentials to access OpEx Hub" 
                : "Fill in your details to create your account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={isLogin ? "login" : "signup"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm border-white/20">
                <TabsTrigger 
                  value="login" 
                  onClick={() => setIsLogin(true)}
                  className="text-white data-[state=active]:bg-cyan-500/30 data-[state=active]:text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsLogin(false)}
                  className="text-white data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-5">
                <TabsContent value="login" className="space-y-5 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-blue-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-blue-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 rounded-lg p-3">
                    <p className="text-xs text-emerald-200 flex items-center gap-2">
                      <FlaskConical className="w-3 h-3" />
                      Demo credentials: john.lead@company.com / password123
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white font-medium">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-blue-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.lead@company.com"
                          className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-blue-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-blue-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="site" className="text-white font-medium text-xs">Site *</Label>
                      <Select value={formData.site} onValueChange={(value) => handleInputChange("site", value)}>
                        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-emerald-400 focus:ring-emerald-400/20">
                          <SelectValue placeholder="Site" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {sites.map((site) => (
                            <SelectItem key={site.code} value={site.code} className="text-white hover:bg-slate-700">
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discipline" className="text-white font-medium text-xs">Discipline *</Label>
                      <Select value={formData.discipline} onValueChange={(value) => handleInputChange("discipline", value)}>
                        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-emerald-400 focus:ring-emerald-400/20">
                          <SelectValue placeholder="Discipline" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {disciplines.map((discipline) => (
                            <SelectItem key={discipline.code} value={discipline.code} className="text-white hover:bg-slate-700">
                              {discipline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white font-medium text-xs">Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-emerald-400 focus:ring-emerald-400/20">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {roles.map((role) => (
                            <SelectItem key={role.code} value={role.code} className="text-white hover:bg-slate-700">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Please wait...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {isLogin ? "Sign In" : "Create Account"}
                    </div>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}