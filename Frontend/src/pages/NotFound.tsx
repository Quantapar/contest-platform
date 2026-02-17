import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-9xl font-extrabold tracking-tighter text-muted">
        404
      </h1>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground w-[400px]">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or doesn't exist.
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
        <Link to="/contests">
          <Button variant="outline">Browse Contests</Button>
        </Link>
      </div>
    </div>
  );
}
