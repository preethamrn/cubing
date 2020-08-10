import requests
import re
from bs4 import BeautifulSoup
import os
import json

url = "https://liquipedia.net/valorant/api.php?action=parse&format=json&page=Transfers/2020"
HTMLCacheFile = 'pagehtml_cache.html'
TransfersCacheFile = 'transfers.csv'


class RequestsException(Exception):
    def __init__(self, message, code=500):
        super(RequestsException, self).__init__(message)
        self.code = code

def getSoup():
    soup = {}
    if os.path.isfile(HTMLCacheFile):
        with open(HTMLCacheFile, mode='r', encoding='utf-8') as f:
            s = f.read()
            return BeautifulSoup(s, features="lxml")
    else:
        response = requests.request("GET", url)
        if response.status_code == 200:
            try:
                page_html = response.json()['parse']['text']['*']
                with open(HTMLCacheFile, mode='w', encoding='utf-8') as f:
                    f.write(page_html)
            except KeyError:
                raise RequestsException(response.json(),response.status_code)	
            return BeautifulSoup(page_html, features="lxml")
        else:
            raise RequestsException(response.json(), response.status_code)

def getTeamName(HTML):
    if HTML.text == 'None':
        return HTML.text
    if HTML.text == 'Retirement':
        return 'None'
    
    icon = HTML.find('a')
    return icon['title']
    

if __name__ == '__main__':
    transfers = []
    soup = getSoup()

    quarters = soup.findAll('div', {'class': 'divTable'})
    for quarter in quarters:
        transfersHTML = quarter.findAll('div', {'class': 'divRow'})
        for transfer in transfersHTML:
            info = transfer.findAll('div', {'class', 'divCell'})
            t = {}
            t['date'] = info[0].text
            t['players'] = [i for i in info[1].text.split('\xa0') if i != '']
            t['old'] = getTeamName(info[2])
            t['new'] = getTeamName(info[4])

            transfers.append(t)

    with open(TransfersCacheFile, mode='w', encoding='utf-8') as f:
        f.write(json.dumps(transfers))
