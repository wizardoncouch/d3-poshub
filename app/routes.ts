import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
    layout('layouts/Wrapper.tsx', [

        index("routes/home.tsx"),

        ...prefix('a', [
            route('l', "routes/admin/login.tsx"),
            layout('layouts/AdminProtected.tsx', [
                index("routes/admin/dashboard.tsx")
            ])
        ]),
        ...prefix('t', [
            route('l', 'routes/terminal/login.tsx'),
            layout('layouts/TerminalProtected.tsx', [
                index("routes/terminal/main.tsx"),
                route('s', 'routes/terminal/spot.tsx'),
                route('f', 'routes/terminal/floor.tsx'),
            ])
        ]),
        ...prefix('i', [
            route('l', 'routes/inventory/login.tsx'),
            layout('layouts/InventoryProtected.tsx', [
                index("routes/inventory/main.tsx"),
                route('c', 'routes/inventory/create.tsx')
            ])
        ]),
        ...prefix('o', [
            layout('layouts/Observer.tsx', [
                index('routes/observe.tsx')
            ])
        ]),
    ]),

    // --- System Routes ---
    route(".well-known/appspecific/*", "routes/[.]well-known.appspecific.$.ts"),
] satisfies RouteConfig;