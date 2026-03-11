// app/routes/[.]well-known.appspecific.$.ts
export const clientLoader = () => {
    return new Response(null, { status: 204 });
};