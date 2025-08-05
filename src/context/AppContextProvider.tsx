import { CytoscapeProvider } from "./CytoscapeGraph/CytoscapeContext"; 
import { RequestProvider } from "./Request/RequestContext";
import { IsGraphProvider } from "./IsGraph/isGraph";
import { AuthProvider } from "./Auth/AuthContext";
import { GraphProvider } from "./GraphContext/GraphContext";

export type ProviderStack = ((children: JSX.Element) => JSX.Element)[];

/**
 * A stack of providers.
 */
const providers = [
  (children) => <AuthProvider>{children}</AuthProvider>,
  (children) => <GraphProvider>{children}</GraphProvider>,
  (children) => <CytoscapeProvider>{children}</CytoscapeProvider>,
  (children) => <RequestProvider>{children}</RequestProvider>,
  (children) => <IsGraphProvider>{children}</IsGraphProvider>,
] as ProviderStack;

export const AppProvider = ({ children }: { children: JSX.Element }) =>
providers.reduceRight((children, mount) => mount(children), children);

