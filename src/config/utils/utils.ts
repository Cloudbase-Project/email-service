import { Injectable } from "@nestjs/common";
import { ApplicationException } from "src/utils/exception/ApplicationException";

@Injectable()
export default class Utils {
  constructor() {}

  fetchPaginationParams(per_page: string, pageParam: string) {
    const perPage = parseInt(per_page) || 10;
    const page = parseInt(pageParam) || 10;

    if (isNaN(page) || isNaN(perPage)) {
      throw new ApplicationException(
        'per_page and page params must be numbers',
        400,
      );
    }
    return { perPage, page };
  }
}
