class Promise {
    constructor(executor) {
        this._resolve = function (data) {};
        this._reject = function (reason) {};
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
        try{
        executor(this.resolve, this.reject);
        } catch(err){
            this.reject(err);
        }
    }

    resolve(data) {
        this._resolve(data);
    }

    reject(reason) {
        this._reject(reason);
    }

    then(func) {
        this._resolve = func;
        return this;
    }

    catch (func) {
        this._reject = func;
    }
}

module.exports=Promise;