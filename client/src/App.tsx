import { Switch, Route } from "wouter";
import { queryClient } from "./api/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SearchPage from "@/pages/SearchPage";
import TokenResultsPage from "@/pages/TokenResultsPage";
import AddressDetailPage from "@/pages/AddressDetailPage";
import TransactionDetailPage from "@/pages/TransactionDetailPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SearchPage} />
      <Route path="/token/:address" component={TokenResultsPage} />
      <Route path="/contract/:address" component={TokenResultsPage} />
      <Route path="/address/:address" component={AddressDetailPage} />
      <Route path="/wallet/:address" component={AddressDetailPage} />
      <Route path="/tx/:hash" component={TransactionDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
