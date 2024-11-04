import { tool } from "ai";
import { z } from 'zod';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Readability, ReadabilityResult } from "@paoramen/cheer-reader"
import { SearxngService, type SearxngServiceConfig } from 'searxng';

const config: SearxngServiceConfig = {
    baseURL: 'https://searx.bndkt.io/',
    defaultSearchParams: {
        format: 'json',
        lang: 'auto',
    },
    defaultRequestHeaders: {
        'Content-Type': 'application/json',
    },
};

const searxngService = new SearxngService(config);
/*
function extractLinks($: cheerio.CheerioAPI): string[] {

    const links = $('a[href]');
    return links.map((index, element) => $(element).attr('href')).get();

}*/

function htmlToText(html: string): string | null {
    const $ = cheerio.load(html);

    // Thanks to the comment on the YouTube video from @eliaspereirah for suggesting 
    // using Mozilla Readability. I used a variant that made it easier to use with 
    // cheerio. Definitely simplifies things
    const text: ReadabilityResult = new Readability($).parse();
    return text?.textContent;
}

export const fetch_url = tool({
    description: 'Fetch the content of a URL',
    parameters: z.object({
        url: z.string().describe('The URL to fetch content from'),
    }),
    execute: async ({ url }) => {
        console.log('fetch url', url)
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
                }
            });
            const text = htmlToText(response.data);
            // console.log('url fetched', text)


            return text;
        } catch (error) {
            console.log('error fetching url', url)
            throw error
        }

    }
})

export const search_web = tool({
    description: 'Search the web for a query',
    parameters: z.object({
        query: z.string().describe('The query to search for'),
    }),
    execute: async ({ query }) => {
        try {
            const results = await searxngService.search(query);
            console.log(results);
        } catch (error) {
            console.error('Search failed:', error);
            throw error
        }
    }
})
