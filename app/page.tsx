import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import{MessageCircle,Video,Shield,Users,Zap}from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
export default function Home() {
  return (
    <div className="">
      <Header />
      <main className="flex-1 flex flex-col items-center  px-4 py-16 sm:px-6
      text-center gap-20">
        <div className="max-w-4xl space-y-8 relative"></div>
        {/* Background Radient */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-50
         via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-20
         dark:to-purple-950/20 rounded-3xl blur-3xl scale-150 opacity-60"></div>
         <div className="max-w-4xl space-y-8 relative">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r
          from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
            Connect Instantly.
            <br /> 
            <span className="bg-clip-text text-transparent bg-linear-to-r
            from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Chat Smarter.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground  max-w-2xl mx-auto leading-relaxed">
            Modern messaging platform that combines lighting-fast Chat and crystal-clear voice calls 
            in one  seamless experience.            
          </p>
         </div>
         <div className="flex  flex-col sm:flex-row justify-center items-center gap-4 pt-6"> 
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Start Chatting Free
                </Button>
              </SignInButton>
            </SignedOut>
         </div> 

          {/* Social Proof */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by Thousands of users worldwide 
              </p>
              <div className="flex justify-center items-center gap-8 text-muted-foreground">
                <div className="text-centre">
                  <div className="text-2xl font-bold text-foreground">50k+</div>
                  <div className="text-sm">Active Users</div>
                </div>
                <div className="w-px h-8 bg-border"></div>  
                <div className="text-centre">
                  <div className="text-2xl font-bold text-foreground">1M+</div>
                  <div className="text-sm">Messages Sent</div>
                </div>
                <div className="w-px h-8 bg-border"></div>  
                <div className="text-centre">
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm">Uptime </div>
                </div>              
              </div>
          </div>
          {/* Enhanced features section  */}
          <div className=" w-full max-w-6xl">
            {/* Section divider */}
            <div className="w-full flex items-center justify-center mb-16">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
            <div className="px-6">
              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
            </div>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold  mb-6">
              Everything you need to stay connected
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for seamless communication, whether you&apos;re 
              chatting with friends or colaborationg with teams.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            <FeatureCard
            icon={MessageCircle}
              title="Instant Messaging"
              description="Lightning-fast messages with real-time delivery. Chat with friends and colleagues seamlessly."
            />
            <FeatureCard
            icon={Video}
              title=" HD Video Calls"
              description="Crystal clear video calls with one click.perfect quality for persolnal and professional chats."
            />
            <FeatureCard
            icon={Shield}
              title="Privacy First"
              description="End-to-end encryption to keep your conversations secure and private."
            />
            <FeatureCard
            icon={Users}
              title="Group Chats"
              description="Create group with friends,family and colleagues.Manage conversation with advanced controls."
            />
            <FeatureCard
            icon={Zap}
              title="Lightning Fast"
              description="Optimized for speed and performance. Works seamlessly across all your devices with instant sync."
            />
          </div>
         </div>
         {/* Enhanced CTA section */}
         <div className="w-full max-w-4xl">
          <div className=" rounded-2xl border bg-linear-to-br from-primary/5 
          to-primary/10 p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to transform your conversations?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto ">
            Join thousands of users who trust Liza for their messaging needs. 
            Sign up today and experience the future of communication.
          </p>
          <div className="flex  flex-col sm:flex-row justify-center items-center gap-4"> 
          <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Start Chatting Free
                </Button>
              </SignInButton>
            </SignedOut>
         </div>
         <div className="flex justify-center flex-col sm:flex-row items-center gap-6 mt-8
          text-sm text-muted-foreground ">
          <div className=" flex text-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            No credit card required.
            </div>
          <div className=" flex text-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Free forever plan.
            </div>
          <div className=" flex text-center gap-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Setup in 30 seconds.
            </div> 
            </div>
            </div> 
            </div>                      
        </main>
      <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xl font-bold tracking-tight">Expert</span>
          <p className="text-sm text-muted-foreground mt-1">
            The future of communication
          </p>
        </div>
        <div className="flex items-center gap-8">
          <a 
          href="#" 
          className=" text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a 
          href="#" 
          className=" text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a 
          href="#" 
          className=" text-sm text-muted-foreground hover:text-foreground transition-colors">
            Support
          </a>
        </div>
        </div>
        <div className=" border-t mt-8  pt-6 text-center ">
          <p className="text-sx text-muted-foreground">
            2025 Liza. All rights reserved.
          </p>
          </div>
        </div>
      </footer>
    </div>
  );
}