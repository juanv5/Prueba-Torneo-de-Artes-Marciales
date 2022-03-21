module.exports = () => ({
    path: '/hello-world/:id',
    method: 'GET',
    response: (req, res, querystring, data, params) => ({
        data: {
            id: params[0],
            message: 'Hello World',
        },
        status: 200,
    }),
    delay: 500,
});
