import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(signupData.email, signupData.password, signupData.name);
      toast({
        title: "Account created!",
        description:
          "Please check your email to confirm your account, or you can disable email confirmation in Supabase settings.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not create account";

      toast({
        title: errorMessage.includes("already registered")
          ? "Account exists"
          : "Signup failed",
        description: errorMessage.includes("already registered")
          ? "This email is already registered. Please login instead."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Task Breakdown",
      description: "Convert complex goals into clear, focused subtasks.",
    },
    {
      icon: CalendarCheck,
      title: "Smart Scheduling",
      description: "Plan tasks around priority, deadlines, and energy.",
    },
    {
      icon: BarChart3,
      title: "Productivity Analytics",
      description: "Track progress, focus time, and completion trends.",
    },
  ];

  const stats = [
    { label: "Planning Accuracy", value: "98%" },
    { label: "Faster Execution", value: "2.4x" },
    { label: "AI Assistance", value: "24/7" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070A16] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#070A16_0%,#0B1020_45%,#111827_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute -right-24 top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 grid min-h-full grid-cols-1 lg:grid-cols-[1fr_0.82fr]">
        <section className="relative hidden px-8 py-8 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/50">
                AI Productivity OS
              </p>
              <h1 className="text-xl font-bold text-white">
                Smart Productivity Planner
              </h1>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-white/80 shadow-lg shadow-primary/10 backdrop-blur">
              <Zap className="h-4 w-4 animate-pulse text-primary" />
              Plan smarter. Focus deeper. Achieve more.
            </div>

            <div className="space-y-6">
              <h2 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl">
                Stop managing tasks. Start{" "}
                <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                  executing goals.
                </span>
              </h2>

              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Powered by AI task breakdowns, smart scheduling, focus tracking,
                and productivity analytics in one premium workspace.
              </p>
            </div>

            <div className="grid max-w-2xl gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 shadow-xl backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.1] hover:shadow-primary/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-2xl"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          {" "}
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-white">
                Smart Productivity Planner
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                AI-powered planning for focused execution.
              </p>
            </div>

            <Card className="relative overflow-hidden border-white/10 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-2xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:content-[''] before:pointer-events-none before:-z-10">
              <div className="relative">
                <CardHeader className="space-y-4 pb-4">
                  
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Target className="h-6 w-6" />
                  </div>

                  <CardTitle className="text-center text-2xl font-bold text-white">
                    Welcome to your planner
                  </CardTitle>

                  <CardDescription className="mx-auto max-w-sm text-center text-slate-400">
                    Login or create an account to continue your productivity
                    journey.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid h-12 w-full grid-cols-2 gap-2 rounded-xl bg-black/25 p-1">
                      {" "}
                      <TabsTrigger
                        value="login"
className="rounded-lg transition-all text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
className="rounded-lg transition-all text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="login-email"
                            className="text-slate-200"
                          >
                            Email
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={loginData.email}
                            onChange={(e) =>
                              setLoginData({
                                ...loginData,
                                email: e.target.value,
                              })
                            }
                            required
                            disabled={isLoading}
                            className="h-12 border-white/10 bg-black/25 text-white placeholder:text-slate-500 focus-visible:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="login-password"
                            className="text-slate-200"
                          >
                            Password
                          </Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) =>
                              setLoginData({
                                ...loginData,
                                password: e.target.value,
                              })
                            }
                            required
                            disabled={isLoading}
                            className="h-12 border-white/10 bg-black/25 text-white placeholder:text-slate-500 focus-visible:ring-primary/60"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="h-12 w-full bg-gradient-to-r from-primary to-fuchsia-500 font-semibold text-white shadow-lg shadow-primary/25 transition hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(168,85,247,0.55)] hover:opacity-95"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            <>
                              Login
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-6">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="signup-name"
                            className="text-slate-200"
                          >
                            Name
                          </Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your Name"
                            value={signupData.name}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                name: e.target.value,
                              })
                            }
                            required
                            disabled={isLoading}
                            className="h-12 border-white/10 bg-black/25 text-white placeholder:text-slate-500 focus-visible:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="signup-email"
                            className="text-slate-200"
                          >
                            Email
                          </Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={signupData.email}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                email: e.target.value,
                              })
                            }
                            required
                            disabled={isLoading}
                            className="h-12 border-white/10 bg-black/25 text-white placeholder:text-slate-500 focus-visible:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="signup-password"
                            className="text-slate-200"
                          >
                            Password
                          </Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={signupData.password}
                            onChange={(e) =>
                              setSignupData({
                                ...signupData,
                                password: e.target.value,
                              })
                            }
                            required
                            disabled={isLoading}
                            minLength={6}
                            className="h-12 border-white/10 bg-black/25 text-white placeholder:text-slate-500 focus-visible:ring-primary/60"
                          />
                          <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            Must be at least 6 characters
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="h-12 w-full bg-gradient-to-r from-primary to-fuchsia-500 font-semibold text-white shadow-lg shadow-primary/25 transition hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(168,85,247,0.55)] hover:opacity-95"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                    {[
                      "Secure Authentication",
                      "AI Powered Planning",
                      "Cloud Sync",
                      "Smart Analytics",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Built for focused execution
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          AI breakdowns, smart scheduling, and productivity
                          analytics in one workspace.
                        </p>
                      </div>
                    </div>
                  </div> */}
                </CardContent>
              </div>
            </Card>

            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300 shadow-lg shadow-cyan-500/10">
                <ShieldCheck className="h-3.5 w-3.5" />
                Enterprise-grade authentication powered by Supabase
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Auth;
