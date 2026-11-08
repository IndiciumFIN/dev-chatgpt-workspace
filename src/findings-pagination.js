/**
 * Pure, bounded presentation window. Never slices the canonical audit report or exports.
 * Pagination is not an assessment of tax conformity.
 */
export const FINDINGS_PAGE_SIZE=50;
export function paginateFindings(items, requestedPage=0, pageSize=FINDINGS_PAGE_SIZE) {
 if(!Array.isArray(items)||!Number.isSafeInteger(pageSize)||pageSize<1||pageSize>100)
  throw new TypeError('Invalid findings pagination input');
 const pages=Math.max(1,Math.ceil(items.length/pageSize));
 const page=Number.isSafeInteger(requestedPage)
  ?Math.max(0,Math.min(requestedPage,pages-1)):0;
 const from=page*pageSize;
 return Object.freeze({page,pages,total:items.length,from,
  to:Math.min(items.length,from+pageSize),
  items:items.slice(from,from+pageSize),hasPrevious:page>0,
  hasNext:page<pages-1});
}
