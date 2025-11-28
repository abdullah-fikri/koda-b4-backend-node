function hateoas(req, page, limit, totalPage) {
  const baseUrl = req.path; 

  const q = { ...req.query };
  delete q.page;
  delete q.limit;

  const queryExtra = new URLSearchParams(q).toString();
  const qs = queryExtra ? `&${queryExtra}` : "";

  return {
    limit: String(limit),
    page: String(page),
    total_page: String(totalPage),
    next:
      page < totalPage
        ? `${baseUrl}?limit=${limit}&page=${page + 1}${qs}`
        : null,
    prev:
      page > 1
        ? `${baseUrl}?limit=${limit}&page=${page - 1}${qs}`
        : null
  };
}

export default hateoas;