# Wells Fargo film branding — production staging

This branch contains a Wells Fargo-branded **fictional film prop** based on the art department's stated permission to use Wells Fargo's name, logo, and brand treatment.

## Do not deploy to the public Pages site without access control

The current public address, `bank-3za.pages.dev`, remains on the independently branded BigBallerBank release. Publish the Wells Fargo version only behind **Cloudflare Access** or equivalent production-only authentication, or package it as a local/offline set prop.

- The Wells Fargo logo image is referenced from Wells Fargo's official public image asset. Before filming, replace the external reference with a locally supplied production-approved copy so the UI remains reliable if the external site is unavailable.
- Use **cast-only** scripted credentials. This build only accepts `cast` / `scene` in its username/password form. Do not enter real Wells Fargo credentials.
- The iPhone passkey relies on the same HTTPS origin as the prior project; changing the website address will require new enrollment.
- Account balances, transactions, transfers, deposits, and banking products remain scripted. They do not connect to financial services.
- The About page expressly says the app is not an official bank application.
- Home Screen icon PNG assets still belong to the original project; production should replace them with authorized, local Wells Fargo icon art before release to a controlled set.
- Preserve production clearance documents outside this repository; do not place a legal release or signatures in source control.

## Production release checklist

1. Restrict the production domain/project with Cloudflare Access.
2. Test both an authenticated crew device and an unauthenticated device. The latter should not see the login screen at all.
3. Replace the externally hosted logo with a production-supplied brand asset and replace Home Screen icon images.
4. Confirm the sign-in never logs or transmits user-supplied passwords. Use only scripted credentials or passkeys.
5. Confirm the prop balance is $88,362.21 and 27 fictional transactions appear with no actual payment action.
6. Merge and deploy only once the production environment and asset license have been confirmed by the production team.
