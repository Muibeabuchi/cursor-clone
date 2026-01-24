import { ShieldAlertIcon } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const UnAuthenticatedView = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-lg bg-muted">
        <Item variant={"outline"}>
          <ItemMedia variant={"icon"}>
            <ShieldAlertIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Unauthorized access</ItemTitle>
            <ItemDescription>
              You must be authenticated to view this page.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Link to="/sign-in">
              <Button variant={"outline"}>Sign In</Button>
            </Link>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
};
