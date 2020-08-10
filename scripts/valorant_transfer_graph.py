import json

TransfersCacheFile = 'transfers.csv'
GraphCacheFile = 'transfer_graph.csv'
TeamsCacheFile = 'transfer_teams.csv'

if __name__ == '__main__':
    transfers = []
    with open(TransfersCacheFile, mode='r', encoding='utf-8') as f:
        transfers = json.loads(f.read())

    transfers.reverse()

    teams = {}
    players = {}

    # TODO Incorporate transfer dates into this to see how long 2 players played together (ie, include a duration for each edge of the graph)
    for t in transfers:
        if t['old'] not in teams:
            teams[t['old']] = set()
        if t['new'] not in teams:
            teams[t['new']] = set()
        for p in t['players']:
            # check if the player actually played in the old team
            if t['old'] != 'None' and p not in teams[t['old']]:
                print('{} missing in {}'.format(p, t['old']))
            # remove player from old team
            teams[t['old']].discard(p)
    
            if p not in players:
                players[p] = {}
                players[p]['teammates'] = set()
                players[p]['transfers'] = []
            players[p]['transfers'].append({'old': t['old'], 'new': t['new'], 'date': t['date']})
            players[p]['current'] = t['new']
            # add links between players
            if t['new'] != 'None':
                for np in teams[t['new']]:
                    if np not in players:
                        players[np] = {}
                        players[np]['teammates'] = set()
                    players[p]['teammates'].add(np)
                    players[np]['teammates'].add(p)
            # add player to new team
            teams[t['new']].add(p)


    # cleanup (remove self edges, convert set to list)
    for p in players:
        if p in players[p]['teammates']:
            print('found self edge for {}'.format(p))
        players[p]['teammates'].discard(p)
        players[p]['teammates'] = [s for s in players[p]['teammates']]

    for t in teams:
        teams[t] = [s for s in teams[t]]
    
    with open(GraphCacheFile, mode='w', encoding='utf-8') as f:
        s = json.dumps(players)
        f.write(s)
    with open(TeamsCacheFile, mode='w', encoding='utf-8') as f:
        s = json.dumps(teams)
        f.write(s)