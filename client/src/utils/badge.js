// Ask the Navbar to re-check its badge count right away
// (after approving/rejecting a registration or viewing posts)
export const refreshBadge = () => window.dispatchEvent(new Event('gc:badge-refresh'));
