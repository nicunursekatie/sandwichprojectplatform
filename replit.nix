
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript
    pkgs.nodePackages.tsx
    pkgs.postgresql_16
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.pandas
    pkgs.python311Packages.openpyxl
    pkgs.python311Packages.psycopg2
    pkgs.python311Packages.python-dotenv
    pkgs.python311Packages.requests
    pkgs.chromium
    pkgs.nss
    pkgs.gtk3
    pkgs.glib
    pkgs.jq
    pkgs.glibcLocales
  ];
}
