/**
 * Module dependencies
 * @private
 */
'use strict';
const _ = require('lodash');
const request = require('superagent');
const parser = require('./parser');
const debug = require('debug')('yeuai:api');

/**
 * Module variables
 * @private
 */

const hostname = 'nlp.yeu.ai';
const endpoint = '/api/v1';
const version = '0.9';

/**
 * Module exports
 * @public
 */

module.exports = (clientAccessToken, options) => {
    return new Application(clientAccessToken);
}

/**
 * Yeuai Application
 * @public
 */
class Application {

    constructor(clientAccessToken, options) {
        // override default options
        this.options = Object.assign({
            hostname: hostname,
            endpoint: endpoint,
            version: version,
            secure: true,
            lang: 'vi',
            requestSource: 'node'
        }, options);

        // client access_token
        this.clientAccessToken = clientAccessToken;
    }

    _headers() {
        return {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.clientAccessToken,
            'api-request-source': this.options.requestSource
        }
    }

    /**
     * Tách từ văn bản tiếng Việt
     * @param {String} text văn bản cần tách từ
     */
    word_tokenize(text) {
        return new Promise((resolve, reject) => {
            let url = `https://${this.options.hostname}/${this.options.endpoint}/tok`;
            request.post(url)
                .set(this._headers())
                .query({
                    text: text
                })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * Gán nhãn từ loại văn bản tiếng Việt
     * @param {String} text văn bản cần gán nhãn
     */
    pos_tag(text) {
        return new Promise((resolve, reject) => {
            let url = `https://${this.options.hostname}/${this.options.endpoint}/tag`;
            request.post(url)
                .set(this._headers())
                .query({
                    text: text
                })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * Chunking
     * @param {String} text 
     */
    chunk(text) {
        return new Promise((resolve, reject) => {
            let url = `https://${this.options.hostname}/${this.options.endpoint}/chunk`;
            request.post(url)
                .set(this._headers())
                .query({
                    text: text
                })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * Named Entity Recoginition
     * @param {String} text 
     */
    ner(text) {
        return new Promise((resolve, reject) => {
            let url = `https://${this.options.hostname}/${this.options.endpoint}/ner`;
            request.post(url)
                .set(this._headers())
                .query({
                    text: text
                })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    /**
     * Phân tích câu hỏi tiếng Việt
     * + Phân loại câu hỏi WH
     * + Phân loại chủ đề câu hỏi
     * @param {String} text 
     */
    classify_qtype(text) {
        return new Promise((resolve, reject) => {
            let url = `https://${this.options.hostname}/${this.options.endpoint}/qtype`;
            request.get(url)
                .set(this._headers())
                .query({
                    text: text
                })
                .end((err, res) => {
                    if (!err) {
                        resolve(res.body)
                    } else {
                        reject(err)
                    }
                })
        })
    }


    /**
     * Phân tích và bóc tách từ loại
     * Thành: Danh từ, động từ, tính từ, thực thể, tên riêng.
     * @param {String} text 
     */
    parse(text) {
        // extract tags
        return this.ner(text).then((result) => {
            let tokens = result.response;
            let posTags = _.map(tokens, (tag) => [tag[0], tag[1]])
            let nerTags = _.map(tokens, (tag) => [tag[0], tag[3]])

            return {
                success: true,
                data: {
                    nouns: parser.matchNouns(posTags),
                    pronouns: parser.matchPronouns(posTags),
                    verbs: parser.matchVerbs(posTags),
                    adverbs: parser.matchAdverbs(posTags),
                    adjectives: parser.matchAdjectives(posTags),
                    entities: parser.matchEntities(nerTags)
                }
            }
        })
    }
}